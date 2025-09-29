'use server';

import z from 'zod';
import bcrypt from 'bcrypt-mini';
import { revalidatePath } from 'next/cache';
import { AppointmentStatus, Day, Gender, TimeSlot } from '@prisma/client';

import prisma from '@/lib/prisma';
import { DATES } from '@/lib/constants';
import { ROLES } from '@/constants/roles';
import { DOMAIN } from '@/constants/domain';
import { ROUTES } from '@/constants/routes';
import { sendEmail } from '@/actions/email';
import { MESSAGES } from '@/constants/messages';
import { removeFile, saveFile } from '@/actions/file';
import { auth, unstable_update as update } from '@/auth';
import { generateToken, loginWithCredentials } from '@/actions/auth';
import { catchErrors, isPastByTime, removeDuplicateTimes } from '@/lib/utils';

import {
  ConfirmAppointment,
  CancelAppointment
} from '@/components/email/appointment/email';

import {
  bioSchema,
  userSchema,
  loginSchema,
  emailSchema,
  doctorSchema,
  userProfileSchema,
  appointmentSchema,
  doctorProfileSchema
} from '@/lib/schemas';

export async function deleteUser(id: string) {
  await prisma.$transaction(async function (transaction) {
    const user = await transaction.user.delete({ where: { id } });
    if (user && user.cover) await removeFile(user.cover);
    if (user && !user.hasOAuth && user.image) await removeFile(user.image);
  });

  revalidatePath(ROUTES.HOME);
}

export async function deleteUsers(ids: string[]) {
  await prisma.$transaction(async function (transaction) {
    const users = await transaction.user.findMany({
      where: { id: { in: ids } }
    });

    await Promise.all([
      transaction.user.deleteMany({ where: { id: { in: ids } } }),
      ...users
        .filter(user => !user.hasOAuth && user.image)
        .map(user => removeFile(user?.image as string)),
      ...users
        .filter(user => user.cover)
        .map(user => removeFile(user?.cover as string))
    ]);
  });

  revalidatePath(ROUTES.HOME);
}

export async function verifyEmail(email: string) {
  try {
    const user = await prisma.$transaction(async function (transaction) {
      const user = await transaction.user.findUnique({ where: { email } });
      if (!user)
        return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

      await transaction.user.update({
        where: { email },
        data: { emailVerified: user.emailVerified ? null : new Date() }
      });

      const token = await transaction.token.findUnique({
        where: { userId: user.id as string }
      });

      if (token) await transaction.token.delete({ where: { id: token.id } });
      return user;
    });

    if (!user) return { success: false, message: MESSAGES.USER.NOT_FOUND };
    revalidatePath(ROUTES.HOME);
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function verifyToken(id: string) {
  try {
    const result = await prisma.$transaction(async function (transaction) {
      const token = await transaction.token.findUnique({ where: { id } });
      if (!token)
        return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

      const hasExpired = new Date(token.expires) < new Date();
      if (hasExpired)
        return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

      const user = await transaction.user.findUnique({
        where: { id: token.userId }
      });

      if (!user)
        return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };
      await transaction.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });

      await transaction.token.delete({ where: { id: token.id } });
      return { user, token, hasExpired };
    });

    if (!result?.token) {
      return { success: false, message: MESSAGES.AUTH.TOKEN_NOT_FOUND };
    }

    if (!result?.user) {
      return { success: false, message: MESSAGES.USER.EMAIL_NOT_FOUND };
    }

    if (result?.hasExpired) {
      return { success: false, message: MESSAGES.AUTH.TOKEN_EXPIRED };
    }

    return {
      success: true,
      email: result.user.email,
      message: MESSAGES.USER.EMAIL_VERIFIED
    };
  } catch (error) {
    return { email: undefined, ...catchErrors(error as Error) };
  }
}

export async function updatePassword({
  email,
  password
}: z.infer<typeof loginSchema>) {
  const result = loginSchema.safeParse({ email, password });
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.user.update({
      where: { email },
      data: { password: bcrypt.hashSync(password, 10) }
    });
  } catch (error) {
    return catchErrors(error as Error);
  }

  return await loginWithCredentials({ email, password });
}

export async function forgetPassword({ email }: z.infer<typeof emailSchema>) {
  const result = emailSchema.safeParse({ email });
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { email, success: false, message: MESSAGES.USER.EMAIL_NOT_FOUND };
    }

    const token = await generateToken(user.id as string);
    const emailSent = await sendEmail(
      email,
      'Reset Your Password',
      `<p>Click <a href="${DOMAIN.LOCAL}/create-password?token=${token.id}">here</a> to reset your password`
    );

    if (!emailSent)
      return { success: false, message: MESSAGES.USER.EMAIL_BOUNCED };
    return { email, success: true, message: MESSAGES.USER.CONFIRM_EMAIL };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
  const result = userSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    const user = await prisma.$transaction(async function (transaction) {
      let existingUser;
      const { email, password } = result.data;
      const user = await transaction.user.findUnique({ where: { id } });

      if (email) {
        existingUser = await transaction.user.findUnique({ where: { email } });
      }

      if (email && email !== user?.email && existingUser)
        return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

      return await prisma.user.update({
        where: { id },
        data: {
          name: result.data.name,
          email: result.data.email,
          password: password ? bcrypt.hashSync(password, 10) : undefined,
          emailVerified: result.data.emailVerified === 'yes' ? new Date() : null
        }
      });
    });

    if (!user) {
      return { success: false, message: MESSAGES.USER.EMAIL_REGISTERED };
    }

    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.USER.PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateUserProfile(
  userId: string,
  data: z.infer<typeof userProfileSchema>
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: MESSAGES.AUTH.UNAUTHORIZED };
    }

    const result = userProfileSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        city: true,
        email: true,
        phone: true,
        image: true,
        cover: true,
        gender: true,
        emailVerified: true
      }
    });

    const image = result.data.image && result.data.image[0];
    const cover = result.data.cover && result.data.cover[0];
    const { email, city, phone, password, gender } = result.data;

    if (!user) return { success: false, message: MESSAGES.USER.NOT_FOUND };

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    });

    if (email !== user.email && emailExists) {
      return { success: false, message: MESSAGES.USER.EMAIL_REGISTERED };
    }

    const updated = await prisma.$transaction(async function (transaction) {
      let imageName, coverName;

      if (image?.size && user.image) await removeFile(user.image);
      if (cover?.size && user.cover) await removeFile(user.cover);

      if (image?.size) imageName = await saveFile(image);
      if (cover?.size) coverName = await saveFile(cover);

      const updated = await transaction.user.update({
        where: { id: userId },
        data: {
          image: imageName,
          cover: coverName,
          name: result.data.name,
          email: email !== user.email ? email : undefined,
          city: city && city !== user.city ? city : undefined,
          phone: phone && phone !== user.phone ? phone : undefined,
          password: password ? bcrypt.hashSync(password, 10) : undefined,
          gender:
            gender && gender !== user.gender ? (gender as Gender) : undefined
        }
      });

      const [role] = await Promise.all([
        transaction.role.findUnique({ where: { name: ROLES.USER as string } }),
        transaction.userRole.deleteMany({
          where: { userId }
        })
      ]);

      await transaction.userRole.create({
        data: { userId, roleId: role?.id as string }
      });

      return updated;
    });

    if (email !== user.email) {
      return loginWithCredentials({
        email: result.data.email,
        password: result.data.password || String()
      });
    }

    await update({
      user: { ...session?.user, cover: updated.cover, image: updated.image }
    });

    return { success: true, message: MESSAGES.USER.PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateBio(id: string, data: z.infer<typeof bioSchema>) {
  try {
    const result = bioSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { bio: true }
    });

    if (!user) {
      return { success: false, message: MESSAGES.AUTH.UNAUTHORIZED };
    }

    if (user.bio) await removeFile(user.bio);

    await prisma.user.update({
      where: { id },
      data: {
        bio: await saveFile(
          new File(
            [new Blob([result.data.bio], { type: 'text/md' })],
            'about.md',
            { type: 'text/md' }
          )
        )
      }
    });

    return { success: true, message: MESSAGES.USER.PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateDoctorProfile(
  doctorId: string,
  data: z.infer<typeof doctorProfileSchema>
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: MESSAGES.AUTH.UNAUTHORIZED };
    }

    const result = doctorProfileSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };
    }

    const user = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        city: true,
        email: true,
        phone: true,
        image: true,
        cover: true,
        gender: true,
        experience: true,
        emailVerified: true
      }
    });

    const {
      city,
      email,
      phone,
      gender,
      timings,
      password,
      experience,
      daysOfVisit,
      specialities
    } = result.data;

    const image = result.data.image && result.data.image[0];
    const cover = result.data.cover && result.data.cover[0];
    if (!user) return { success: false, message: MESSAGES.USER.NOT_FOUND };

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    });

    if (email !== user.email && emailExists) {
      return { success: false, message: MESSAGES.USER.EMAIL_REGISTERED };
    }

    const updated = await prisma.$transaction(async function (transaction) {
      let imageName, coverName;

      if (image?.size && user.image) await removeFile(user.image);
      if (cover?.size && user.cover) await removeFile(user.cover);

      if (image?.size) imageName = await saveFile(image);
      if (cover?.size) coverName = await saveFile(cover);

      const updated = await transaction.user.update({
        where: { id: doctorId },
        data: {
          image: imageName,
          cover: coverName,
          name: result.data.name,
          email: email !== user.email ? email : undefined,
          city: city && city !== user.city ? city : undefined,
          phone: phone && phone !== user.phone ? phone : undefined,
          gender: gender && gender !== user.gender ? gender : undefined,
          password: password ? bcrypt.hashSync(password, 10) : undefined,
          experience:
            experience && experience !== user.experience
              ? experience
              : undefined,
          daysOfVisit:
            daysOfVisit && daysOfVisit.length
              ? (daysOfVisit as Day[])
              : undefined
        }
      });

      if (specialities && specialities.length) {
        await transaction.userSpeciality.deleteMany({
          where: { userId: doctorId }
        });

        await transaction.userSpeciality.createMany({
          data: specialities.map(s => ({ userId: doctorId, specialityId: s }))
        });
      }

      if (timings && timings.length) {
        await transaction.timeSlot.deleteMany({ where: { userId: doctorId } });
        await transaction.user.update({
          where: { id: doctorId },
          data: {
            timings: {
              create: removeDuplicateTimes(timings)?.map(t => ({
                time: t.time,
                duration: t.duration
              })) as TimeSlot[]
            }
          }
        });
      }

      const [role] = await Promise.all([
        transaction.role.findUnique({
          where: { name: ROLES.DOCTOR as string }
        }),
        transaction.userRole.deleteMany({
          where: { userId: doctorId }
        })
      ]);

      await transaction.userRole.create({
        data: { userId: doctorId, roleId: role?.id as string }
      });

      return updated;
    });

    if (email !== user.email) {
      return loginWithCredentials({
        email: result.data.email,
        password: result.data.password || String()
      });
    }

    await update({
      user: { ...session?.user, cover: updated.cover, image: updated.image }
    });

    return { success: false, message: MESSAGES.USER.PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addDoctor(data: z.infer<typeof doctorSchema>) {
  const result = doctorSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  const timings = result.data.timings;
  const specialities = result.data.specialities;
  const image = result.data.image && result.data.image[0];

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (user)
      return { success: false, message: MESSAGES.USER.EMAIL_REGISTERED };

    await prisma.$transaction(async function (transaction) {
      let fileName;
      if (image?.size) fileName = await saveFile(image);

      const role = await transaction.role.findUnique({
        where: { name: ROLES.DOCTOR as string }
      });

      const user = await transaction.user.create({
        data: {
          image: fileName,
          name: result.data.name,
          city: result.data.city,
          email: result.data.email,
          phone: result.data.phone,
          gender: result.data.gender,
          experience: result.data.experience,
          daysOfVisit: (result.data.daysOfVisit as Day[]) || undefined,
          password: bcrypt.hashSync(result.data.password as string, 10),
          timings: {
            create: removeDuplicateTimes(timings)?.map(t => ({
              time: t.time,
              duration: t.duration
            })) as TimeSlot[]
          }
        }
      });

      if (specialities.length) {
        await transaction.userSpeciality.createMany({
          data: specialities.map(s => ({ userId: user.id, specialityId: s }))
        });
      }

      await transaction.userRole.create({
        data: { userId: user.id, roleId: role?.id as string }
      });
    });
  } catch (error) {
    return catchErrors(error as Error);
  }

  return loginWithCredentials({
    email: result.data.email,
    password: result.data.password
  });
}

export async function getAppointment(
  doctorId: string,
  data: z.infer<typeof appointmentSchema>
) {
  const result = appointmentSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: MESSAGES.USER.NOT_FOUND };
    }

    const time = await prisma.timeSlot.findUnique({
      select: { time: true },
      where: { id: result.data.time }
    });

    if (
      !time ||
      !isPastByTime(
        result.data.date,
        time.time,
        (DATES.EXPIRES_AT as number) * 1000
      )
    ) {
      return {
        success: false,
        message: MESSAGES.APPOINTMENT.INVALID_TIME_SLOT
      };
    }

    if (
      await prisma.appointment.findFirst({
        where: {
          doctorId,
          date: result.data.date,
          patientId: session.user.id,
          timeSlotId: result.data.time
        }
      })
    ) {
      return { success: false, message: MESSAGES.APPOINTMENT.EXISTS };
    }

    await prisma.appointment.create({
      data: {
        doctorId,
        name: result.data.name,
        city: result.data.city,
        date: result.data.date,
        email: result.data.email,
        phone: result.data.phone,
        notes: result.data.notes,
        patientId: session.user.id,
        timeSlotId: result.data.time
      }
    });

    return { success: true, message: MESSAGES.APPOINTMENT.CREATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: MESSAGES.USER.NOT_FOUND };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { date: true, timeSlot: { select: { time: true } } }
    });

    if (!appointment) {
      return { success: false, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    const isInFuture = isPastByTime(
      appointment?.date,
      appointment?.timeSlot.time,
      (DATES.EXPIRES_AT as number) * 1000
    );

    if (!isInFuture) {
      return {
        success: false,
        message: MESSAGES.APPOINTMENT.ACTION_RESTRICTED
      };
    }

    const updated = await prisma.$transaction(async function (transaction) {
      return await transaction.appointment.update({
        where: { id },
        data: { status: status as AppointmentStatus },
        select: {
          date: true,
          doctor: { select: { email: true, name: true } },
          patient: { select: { email: true, name: true } },
          timeSlot: { select: { time: true, duration: true } }
        }
      });
    });

    const data = {
      data: {
        time: updated.timeSlot.time,
        date: updated.date.toString(),
        doctorName: updated.doctor.name as string,
        patientName: updated.patient.name as string,
        duration: updated.timeSlot.duration.toString()
      }
    };

    if (status === AppointmentStatus.confirmed) {
      await Promise.all([
        sendEmail(
          updated.doctor.email as string,
          'Appointment Confirmed',
          ConfirmAppointment(data)
        ),
        sendEmail(
          updated.patient.email as string,
          'Appointment Confirmed',
          ConfirmAppointment(data)
        )
      ]);
    }

    if (status === AppointmentStatus.cancelled) {
      await Promise.all([
        sendEmail(
          updated.doctor.email as string,
          'Appointment Cancelled',
          CancelAppointment(data)
        ),
        sendEmail(
          updated.patient.email as string,
          'Appointment Cancelled',
          CancelAppointment(data)
        )
      ]);
    }

    revalidatePath('/');
    return {
      success: true,
      message:
        status === AppointmentStatus.confirmed
          ? MESSAGES.APPOINTMENT.CONFIRMED
          : MESSAGES.APPOINTMENT.CANCELLED
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
