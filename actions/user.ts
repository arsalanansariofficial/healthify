'use server';

import { AppointmentStatus, Day, Gender, TimeSlot } from '@prisma/client';
import bcrypt from 'bcrypt-mini';
import { revalidatePath } from 'next/cache';
import z from 'zod';

import { generateToken, loginWithCredentials } from '@/actions/auth';
import { sendEmail } from '@/actions/email';
import { removeFile, saveFile } from '@/actions/file';
import { auth, unstable_update as update } from '@/auth';
import {
  ConfirmAppointment,
  CancelAppointment
} from '@/components/email/appointment/email';
import { DOMAIN } from '@/constants/domain';
import { MESSAGES } from '@/constants/messages';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { DATES } from '@/lib/constants';
import prisma from '@/lib/prisma';
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
import { catchErrors, isPastByTime, removeDuplicateTimes } from '@/lib/utils';

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
        return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

      await transaction.user.update({
        data: { emailVerified: user.emailVerified ? null : new Date() },
        where: { email }
      });

      const token = await transaction.token.findUnique({
        where: { userId: user.id as string }
      });

      if (token) await transaction.token.delete({ where: { id: token.id } });
      return user;
    });

    if (!user) return { message: MESSAGES.USER.NOT_FOUND, success: false };
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
        return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

      const hasExpired = new Date(token.expires) < new Date();
      if (hasExpired)
        return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

      const user = await transaction.user.findUnique({
        where: { id: token.userId }
      });

      if (!user)
        return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
      await transaction.user.update({
        data: { emailVerified: new Date() },
        where: { id: user.id }
      });

      await transaction.token.delete({ where: { id: token.id } });
      return { hasExpired, token, user };
    });

    if (!result?.token) {
      return { message: MESSAGES.AUTH.TOKEN_NOT_FOUND, success: false };
    }

    if (!result?.user) {
      return { message: MESSAGES.USER.EMAIL_NOT_FOUND, success: false };
    }

    if (result?.hasExpired) {
      return { message: MESSAGES.AUTH.TOKEN_EXPIRED, success: false };
    }

    return {
      email: result.user.email,
      message: MESSAGES.USER.EMAIL_VERIFIED,
      success: true
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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.user.update({
      data: { password: bcrypt.hashSync(password, 10) },
      where: { email }
    });
  } catch (error) {
    return catchErrors(error as Error);
  }

  return await loginWithCredentials({ email, password });
}

export async function forgetPassword({ email }: z.infer<typeof emailSchema>) {
  const result = emailSchema.safeParse({ email });
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { email, message: MESSAGES.USER.EMAIL_NOT_FOUND, success: false };
    }

    const token = await generateToken(user.id as string);
    const emailSent = await sendEmail(
      email,
      'Reset Your Password',
      `<p>Click <a href="${DOMAIN.LOCAL}/create-password?token=${token.id}">here</a> to reset your password`
    );

    if (!emailSent)
      return { message: MESSAGES.USER.EMAIL_BOUNCED, success: false };
    return { email, message: MESSAGES.USER.CONFIRM_EMAIL, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
  const result = userSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    const user = await prisma.$transaction(async function (transaction) {
      let existingUser;
      const { email, password } = result.data;
      const user = await transaction.user.findUnique({ where: { id } });

      if (email) {
        existingUser = await transaction.user.findUnique({ where: { email } });
      }

      if (email && email !== user?.email && existingUser)
        return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

      return await prisma.user.update({
        data: {
          email: result.data.email,
          emailVerified:
            result.data.emailVerified === 'yes' ? new Date() : null,
          name: result.data.name,
          password: password ? bcrypt.hashSync(password, 10) : undefined
        },
        where: { id }
      });
    });

    if (!user) {
      return { message: MESSAGES.USER.EMAIL_REGISTERED, success: false };
    }

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.USER.PROFILE_UPDATED, success: true };
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
      return { message: MESSAGES.AUTH.UNAUTHORIZED, success: false };
    }

    const result = userProfileSchema.safeParse(data);

    if (!result.success) {
      return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
    }

    const user = await prisma.user.findUnique({
      select: {
        city: true,
        cover: true,
        email: true,
        emailVerified: true,
        gender: true,
        image: true,
        phone: true
      },
      where: { id: userId }
    });

    const { city, cover, email, gender, image, password, phone } = result.data;

    if (!user) return { message: MESSAGES.USER.NOT_FOUND, success: false };

    const emailExists = await prisma.user.findUnique({
      select: { email: true },
      where: { email }
    });

    if (email !== user.email && emailExists) {
      return { message: MESSAGES.USER.EMAIL_REGISTERED, success: false };
    }

    const updated = await prisma.$transaction(async function (transaction) {
      let imageName, coverName;

      if (image instanceof File && image.size) {
        imageName = await saveFile(image);
      }

      if (cover instanceof File && cover.size) {
        coverName = await saveFile(cover);
      }

      const updated = await transaction.user.update({
        data: {
          city: city && city !== user.city ? city : undefined,
          cover: coverName,
          email: email !== user.email ? email : undefined,
          gender:
            gender && gender !== user.gender ? (gender as Gender) : undefined,
          image: imageName,
          name: result.data.name,
          password: password ? bcrypt.hashSync(password, 10) : undefined,
          phone: phone && phone !== user.phone ? phone : undefined
        },
        where: { id: userId }
      });

      const [role] = await Promise.all([
        transaction.role.findUnique({ where: { name: ROLES.USER as string } }),
        transaction.userRole.deleteMany({
          where: { userId }
        })
      ]);

      await transaction.userRole.create({
        data: { roleId: role?.id as string, userId }
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

    return { message: MESSAGES.USER.PROFILE_UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateBio(id: string, data: z.infer<typeof bioSchema>) {
  try {
    const result = bioSchema.safeParse(data);

    if (!result.success) {
      return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
    }

    const user = await prisma.user.findUnique({
      select: { bio: true },
      where: { id }
    });

    if (!user) {
      return { message: MESSAGES.AUTH.UNAUTHORIZED, success: false };
    }

    if (user.bio) await removeFile(user.bio);

    await prisma.user.update({
      data: {
        bio: await saveFile(
          new File(
            [new Blob([result.data.bio], { type: 'text/md' })],
            'about.md',
            { type: 'text/md' }
          )
        )
      },
      where: { id }
    });

    return { message: MESSAGES.USER.PROFILE_UPDATED, success: true };
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
      return { message: MESSAGES.AUTH.UNAUTHORIZED, success: false };
    }

    const result = doctorProfileSchema.safeParse(data);

    if (!result.success) {
      return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
    }

    const user = await prisma.user.findUnique({
      select: {
        city: true,
        cover: true,
        email: true,
        emailVerified: true,
        experience: true,
        gender: true,
        image: true,
        phone: true
      },
      where: { id: doctorId }
    });

    const {
      city,
      cover,
      daysOfVisit,
      email,
      experience,
      gender,
      image,
      password,
      phone,
      specialities,
      timings
    } = result.data;

    if (!user) return { message: MESSAGES.USER.NOT_FOUND, success: false };

    const emailExists = await prisma.user.findUnique({
      select: { email: true },
      where: { email }
    });

    if (email !== user.email && emailExists) {
      return { message: MESSAGES.USER.EMAIL_REGISTERED, success: false };
    }

    const updated = await prisma.$transaction(async function (transaction) {
      let imageName, coverName;

      if (image instanceof File && image?.size && user.image) {
        await removeFile(user.image);
      }

      if (cover instanceof File && cover?.size && user.cover) {
        await removeFile(user.cover);
      }

      if (image instanceof File && image?.size) {
        imageName = await saveFile(image);
      }

      if (cover instanceof File && cover?.size) {
        coverName = await saveFile(cover);
      }

      const updated = await transaction.user.update({
        data: {
          city: city && city !== user.city ? city : undefined,
          cover: coverName,
          daysOfVisit:
            daysOfVisit && daysOfVisit.length
              ? (daysOfVisit as Day[])
              : undefined,
          email: email !== user.email ? email : undefined,
          experience:
            experience && experience !== user.experience
              ? experience
              : undefined,
          gender: gender && gender !== user.gender ? gender : undefined,
          image: imageName,
          name: result.data.name,
          password: password ? bcrypt.hashSync(password, 10) : undefined,
          phone: phone && phone !== user.phone ? phone : undefined
        },
        where: { id: doctorId }
      });

      if (specialities && specialities.length) {
        await transaction.userSpeciality.deleteMany({
          where: { userId: doctorId }
        });

        await transaction.userSpeciality.createMany({
          data: specialities.map(s => ({ specialityId: s, userId: doctorId }))
        });
      }

      if (timings && timings.length) {
        await transaction.timeSlot.deleteMany({ where: { userId: doctorId } });
        await transaction.user.update({
          data: {
            timings: {
              create: removeDuplicateTimes(timings)?.map(t => ({
                duration: t.duration,
                time: t.time
              })) as TimeSlot[]
            }
          },
          where: { id: doctorId }
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
        data: { roleId: role?.id as string, userId: doctorId }
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

    return { message: MESSAGES.USER.PROFILE_UPDATED, success: false };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addDoctor(data: z.infer<typeof doctorSchema>) {
  const result = doctorSchema.safeParse(data);

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  const { image, specialities, timings } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (user) {
      return { message: MESSAGES.USER.EMAIL_REGISTERED, success: false };
    }

    await prisma.$transaction(async function (transaction) {
      let fileName;

      if (image instanceof File && image?.size) {
        fileName = await saveFile(image);
      }

      const role = await transaction.role.findUnique({
        where: { name: ROLES.DOCTOR as string }
      });

      const user = await transaction.user.create({
        data: {
          city: result.data.city,
          daysOfVisit: (result.data.daysOfVisit as Day[]) || undefined,
          email: result.data.email,
          experience: result.data.experience,
          gender: result.data.gender,
          image: fileName,
          name: result.data.name,
          password: bcrypt.hashSync(result.data.password as string, 10),
          phone: result.data.phone,
          timings: {
            create: removeDuplicateTimes(timings)?.map(t => ({
              duration: t.duration,
              time: t.time
            })) as TimeSlot[]
          }
        }
      });

      if (specialities.length) {
        await transaction.userSpeciality.createMany({
          data: specialities.map(s => ({ specialityId: s, userId: user.id }))
        });
      }

      await transaction.userRole.create({
        data: { roleId: role?.id as string, userId: user.id }
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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { message: MESSAGES.USER.NOT_FOUND, success: false };
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
        message: MESSAGES.APPOINTMENT.INVALID_TIME_SLOT,
        success: false
      };
    }

    if (
      await prisma.appointment.findFirst({
        where: {
          date: result.data.date,
          doctorId,
          patientId: session.user.id,
          timeSlotId: result.data.time
        }
      })
    ) {
      return { message: MESSAGES.APPOINTMENT.EXISTS, success: false };
    }

    await prisma.appointment.create({
      data: {
        city: result.data.city,
        date: result.data.date,
        doctorId,
        email: result.data.email,
        name: result.data.name,
        notes: result.data.notes,
        patientId: session.user.id,
        phone: result.data.phone,
        timeSlotId: result.data.time
      }
    });

    return { message: MESSAGES.APPOINTMENT.CREATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { message: MESSAGES.USER.NOT_FOUND, success: false };
    }

    const appointment = await prisma.appointment.findUnique({
      select: { date: true, timeSlot: { select: { time: true } } },
      where: { id }
    });

    if (!appointment) {
      return { message: MESSAGES.APPOINTMENT.NOT_FOUND, success: false };
    }

    const isInFuture = isPastByTime(
      appointment?.date,
      appointment?.timeSlot.time,
      (DATES.EXPIRES_AT as number) * 1000
    );

    if (!isInFuture) {
      return {
        message: MESSAGES.APPOINTMENT.ACTION_RESTRICTED,
        success: false
      };
    }

    const updated = await prisma.$transaction(async function (transaction) {
      return await transaction.appointment.update({
        data: { status: status as AppointmentStatus },
        select: {
          date: true,
          doctor: { select: { email: true, name: true } },
          patient: { select: { email: true, name: true } },
          timeSlot: { select: { duration: true, time: true } }
        },
        where: { id }
      });
    });

    const data = {
      data: {
        date: updated.date.toString(),
        doctorName: updated.doctor.name as string,
        duration: updated.timeSlot.duration.toString(),
        patientName: updated.patient.name as string,
        time: updated.timeSlot.time
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
      message:
        status === AppointmentStatus.confirmed
          ? MESSAGES.APPOINTMENT.CONFIRMED
          : MESSAGES.APPOINTMENT.CANCELLED,
      success: true
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
