'use server';

import bcrypt from 'bcrypt-mini';
import { z, ZodSchema } from 'zod';
import nodemailer from 'nodemailer';
import * as P from '@prisma/client';
import { isFuture } from 'date-fns';
import { revalidatePath } from 'next/cache';

import * as dfns from 'date-fns';
import prisma from '@/lib/prisma';
import * as utils from '@/lib/utils';
import * as CONST from '@/lib/constants';
import * as schemas from '@/lib/schemas';
import { formatChange } from '@/lib/utils';
import { VerifyEmail } from '@/components/email/account/email';
import { auth, signIn, unstable_update as update } from '@/auth';
import * as Template from '@/components/email/appointment/email';

type Schema<T extends ZodSchema> = z.infer<T>;

async function removeFile(slug: string) {
  const result = await fetch(`${CONST.HOST}/api/upload/${slug}`, {
    method: 'DELETE'
  });

  const response = await result.json();
  if (!response.success) throw new Error(response.message);
}

async function saveFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const result = await fetch(`${CONST.HOST}/api/upload`, {
    method: 'POST',
    body: formData
  });

  const response = await result.json();
  if (!response.success) throw new Error(response.message);
  return response.file as string;
}

async function generateToken(userId: string) {
  return await prisma.$transaction(async function (transaction) {
    const token = await transaction.token.findUnique({ where: { userId } });
    if (token) await transaction.token.delete({ where: { userId } });
    return await transaction.token.create({
      data: { userId, expires: new Date(Date.now() + CONST.EXPIRES_AT * 1000) }
    });
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    secure: true,
    host: CONST.SMTP_HOST_NAME,
    port: CONST.SMTP_PORT_NUMBER,
    auth: {
      user: CONST.SMTP_EMAIL,
      pass: CONST.SMTP_PASSWORD
    }
  });

  return await transporter.sendMail({
    to,
    html,
    subject,
    from: CONST.SMTP_EMAIL
  });
}

export async function loginWithCredentials({
  email,
  password
}: Schema<typeof schemas.loginSchema>) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: CONST.EMAIL_NOT_FOUND };
    }

    if (!user.emailVerified) {
      const token = await generateToken(user.id as string);

      if (!token) {
        return { success: false, message: CONST.TOKEN_NOT_GENERATED };
      }

      const html = VerifyEmail({ data: { token: token.id } });
      const subject = `${CONST.HOST}/verify?token=${token.id}`;
      const emailSent = await sendEmail(email, subject, html);

      if (!emailSent) {
        return { success: false, message: CONST.EMAIL_FAILED };
      }

      return { success: true, message: CONST.CONFIRM_EMAIL };
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: CONST.DASHBOARD
    });
  } catch (error) {
    return utils.catchAuthError(error as Error);
  }
}

export async function deleteSpeciality(id: string) {
  await prisma.speciality.delete({ where: { id } });
  revalidatePath(CONST.HOME);
}

export async function deleteSpecialities(ids: string[]) {
  await prisma.speciality.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(CONST.HOME);
}

export async function deleteUser(id: string) {
  await prisma.$transaction(async function (transaction) {
    const user = await transaction.user.delete({ where: { id } });
    if (user && user.image) await removeFile(user.image);
  });

  revalidatePath(CONST.HOME);
}

export async function deleteUsers(ids: string[]) {
  await prisma.$transaction(async function (transaction) {
    const users = await transaction.user.findMany({
      where: { id: { in: ids } }
    });

    await Promise.all([
      transaction.user.deleteMany({ where: { id: { in: ids } } }),
      ...users
        .filter(user => !!user.image)
        .map(user => removeFile(user?.image as string))
    ]);
  });

  revalidatePath(CONST.HOME);
}

export async function assignRoles(
  id: string,
  data: Schema<typeof schemas.userRolesSchema>
) {
  const result = schemas.userRolesSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    const session = await auth();

    const [, , roles] = await prisma.$transaction(async function (transaction) {
      return await Promise.all([
        transaction.userRole.deleteMany({ where: { userId: id } }),
        transaction.userRole.createMany({
          data: data.roles.map(roleId => ({ roleId, userId: id }))
        }),
        transaction.userRole.findMany({
          where: { userId: id },
          select: { id: true, role: true }
        })
      ]);
    });

    await update({ user: { ...session?.user, roles: roles.map(r => r.role) } });
    return { success: true, message: CONST.ROLES_ASSIGNED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function verifyEmail(email: string) {
  try {
    const user = await prisma.$transaction(async function (transaction) {
      const user = await transaction.user.findUnique({ where: { email } });
      if (!user) return { success: false, message: CONST.INVALID_INPUTS };

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

    if (!user) return { success: false, message: CONST.USER_NOT_FOUND };
    revalidatePath(CONST.HOME);
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function assignPermissions({
  name,
  permissions
}: Schema<typeof schemas.rolePermissionsSchema>) {
  const result = schemas.rolePermissionsSchema.safeParse({ name, permissions });
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    const session = await auth();

    await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({ where: { name } });
      if (!role) return { roles: [], permits: [] };

      const deletePermissions = transaction.rolePermission.deleteMany({
        where: { roleId: role.id }
      });

      const addPermissions = transaction.rolePermission.createMany({
        data: permissions.map(p => ({ roleId: role.id, permissionId: p }))
      });

      if (!permissions.length) return await deletePermissions;
      await Promise.all([deletePermissions, addPermissions]);
    });

    const permits = await prisma.rolePermission.findMany({
      select: { permission: true },
      where: { roleId: { in: session?.user?.roles.map(r => r.id) } }
    });

    await update({
      user: { ...session?.user, permissions: permits.map(rp => rp.permission) }
    });

    revalidatePath(CONST.HOME);
    return { success: true, message: CONST.PERMISSIONS_ASSIGNED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function updateSpeciality(
  id: string,
  { name }: Schema<typeof schemas.nameSchema>
) {
  const result = schemas.nameSchema.safeParse({ name });
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    await prisma.speciality.update({
      where: { id },
      data: { name: name.toUpperCase() }
    });

    revalidatePath(CONST.HOME);
    return {
      success: true,
      message: CONST.SPECIALITY_UPDATED
    };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function addSpeciality({
  name
}: Schema<typeof schemas.nameSchema>) {
  const result = schemas.nameSchema.safeParse({ name });
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    await prisma.speciality.create({
      data: { name: result.data.name?.toUpperCase() as string }
    });

    revalidatePath(CONST.HOME);
    return {
      success: true,
      name: name.toUpperCase(),
      message: CONST.SPECIALITY_ADDED
    };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function addRole(data: Schema<typeof schemas.roleSchema>) {
  const result = schemas.roleSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    await prisma.role.create({
      data: { name: result.data.name.toUpperCase() }
    });

    return { ...data, success: true, message: CONST.ROLE_ADDED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function addPermission(
  data: Schema<typeof schemas.permissionSchema>
) {
  const result = schemas.permissionSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    await prisma.permission.create({
      data: { name: result.data.name.toUpperCase() }
    });

    return {
      ...data,
      success: true,
      message: CONST.PERMISSION_ADDED
    };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function verifyToken(id: string) {
  try {
    const result = await prisma.$transaction(async function (transaction) {
      const token = await transaction.token.findUnique({ where: { id } });
      if (!token) return { success: false, message: CONST.INVALID_INPUTS };

      const hasExpired = new Date(token.expires) < new Date();
      if (hasExpired) return { success: false, message: CONST.INVALID_INPUTS };

      const user = await transaction.user.findUnique({
        where: { id: token.userId }
      });

      if (!user) return { success: false, message: CONST.INVALID_INPUTS };
      await transaction.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });

      await transaction.token.delete({ where: { id: token.id } });
      return { user, token, hasExpired };
    });

    if (!result?.token) {
      return { success: false, message: CONST.TOKEN_NOT_FOUND };
    }

    if (!result?.user) {
      return { success: false, message: CONST.EMAIL_NOT_FOUND };
    }

    if (result?.hasExpired) {
      return { success: false, message: CONST.TOKEN_EXPIRED };
    }

    return {
      success: true,
      email: result.user.email,
      message: CONST.EMAIL_VERIFIED
    };
  } catch (error) {
    return { email: undefined, ...utils.catchErrors(error as Error) };
  }
}

export async function login(data: Schema<typeof schemas.loginSchema>) {
  const email = data.email as string;
  const password = data.password as string;

  const result = schemas.loginSchema.safeParse({ email, password });
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  return await loginWithCredentials({ email, password });
}

export async function signup(data: Schema<typeof schemas.signupSchema>) {
  const result = schemas.signupSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email as string }
    });

    if (user) return { success: false, message: CONST.EMAIL_REGISTERED };

    await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({
        where: { name: CONST.DEFAULT_ROLE }
      });

      const user = await transaction.user.create({
        data: {
          name: result.data.name,
          email: result.data.email,
          password: bcrypt.hashSync(result.data.password as string, 10)
        }
      });

      await transaction.userRole.create({
        data: { userId: user.id, roleId: role?.id as string }
      });
    });
  } catch (error) {
    return utils.catchErrors(error as Error);
  }

  return loginWithCredentials(data);
}

export default async function seed() {
  try {
    await prisma.$transaction(async function (transaction) {
      const [role, permission, user] = await Promise.all([
        await transaction.role.create({
          data: { name: CONST.ADMIN_ROLE }
        }),
        transaction.permission.create({
          data: { name: CONST.DEFAULT_PERMISSION }
        }),
        transaction.user.create({
          data: {
            name: CONST.ADMIN_NAME,
            email: CONST.ADMIN_EMAIL,
            emailVerified: new Date(),
            password: bcrypt.hashSync(CONST.ADMIN_PASSWORD, 10)
          }
        })
      ]);

      await Promise.all([
        prisma.userRole.create({
          data: { userId: user.id, roleId: role.id }
        }),
        prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id }
        })
      ]);
    });

    return { success: true, message: CONST.DATABASE_UPDATED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function updatePassword({
  email,
  password
}: Schema<typeof schemas.loginSchema>) {
  const result = schemas.loginSchema.safeParse({ email, password });
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    await prisma.user.update({
      where: { email },
      data: { password: bcrypt.hashSync(password, 10) }
    });
  } catch (error) {
    return utils.catchErrors(error as Error);
  }

  return await loginWithCredentials({ email, password });
}

export async function forgetPassword({
  email
}: Schema<typeof schemas.emailSchema>) {
  const result = schemas.emailSchema.safeParse({ email });
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { email, success: false, message: CONST.EMAIL_NOT_FOUND };
    }

    const token = await generateToken(user.id as string);
    const emailSent = await sendEmail(
      email,
      'Reset Your Password',
      `<p>Click <a href="${CONST.HOST}/create-password?token=${token.id}">here</a> to reset your password`
    );

    if (!emailSent) return { success: false, message: CONST.EMAIL_FAILED };
    return { email, success: true, message: CONST.CONFIRM_EMAIL };
  } catch (error) {
    return { email, ...utils.catchErrors(error as Error) };
  }
}

export async function updateUser(
  id: string,
  data: Schema<typeof schemas.userSchema>
) {
  const result = schemas.userSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    const user = await prisma.$transaction(async function (transaction) {
      let existingUser;
      const { email, password } = result.data;
      const user = await transaction.user.findUnique({ where: { id } });

      if (email) {
        existingUser = await transaction.user.findUnique({ where: { email } });
      }

      if (email && email !== user?.email && existingUser)
        return { success: false, message: CONST.INVALID_INPUTS };

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
      return { success: false, message: CONST.EMAIL_REGISTERED };
    }

    revalidatePath(CONST.HOME);
    return { success: true, message: CONST.PROFILE_UPDATED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function addDoctor(data: Schema<typeof schemas.doctorSchema>) {
  const result = schemas.doctorSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  const timings = result.data.timings;
  const specialities = result.data.specialities;
  const image = result.data.image && result.data.image[0];

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (user) return { success: false, message: CONST.EMAIL_REGISTERED };

    await prisma.$transaction(async function (transaction) {
      let fileName;
      if (image?.size) fileName = await saveFile(image);

      const role = await transaction.role.findUnique({
        where: { name: CONST.DOCTOR_ROLE }
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
          password: bcrypt.hashSync(result.data.password as string, 10),
          daysOfVisit: (result.data.daysOfVisit as P.Day[]) || undefined,
          timings: {
            create: utils.removeDuplicateTimes(timings)?.map(t => ({
              time: t.time,
              duration: t.duration
            })) as P.TimeSlot[]
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
    return utils.catchErrors(error as Error);
  }

  return loginWithCredentials({
    email: result.data.email,
    password: result.data.password
  });
}

export async function getAppointment(
  doctorId: string,
  data: Schema<typeof schemas.appointmentSchema>
) {
  const result = schemas.appointmentSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: CONST.USER_NOT_FOUND };
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

    return { success: true, message: CONST.APPOINTMENT_CREATED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function updateUserProfile(
  userId: string,
  data: Schema<typeof schemas.userProfileSchema>
) {
  try {
    const result = schemas.userProfileSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: CONST.INVALID_INPUTS };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        city: true,
        email: true,
        phone: true,
        image: true,
        gender: true,
        emailVerified: true
      }
    });

    const image = result.data.image && result.data.image[0];
    const { email, city, phone, password, gender } = result.data;

    if (!user) return { success: false, message: CONST.USER_NOT_FOUND };

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    });

    if (email !== user.email && emailExists) {
      return { success: false, message: CONST.EMAIL_REGISTERED };
    }

    await prisma.$transaction(async function (transaction) {
      let fileName;

      if (image?.size && user.image) await removeFile(user.image);
      if (image?.size) fileName = await saveFile(image);

      await transaction.user.update({
        where: { id: userId },
        data: {
          image: fileName,
          name: result.data.name,
          email: email !== user.email ? email : undefined,
          city: city && city !== user.city ? city : undefined,
          phone: phone && phone !== user.phone ? phone : undefined,
          gender: gender && gender !== user.gender ? gender : undefined,
          password: password ? bcrypt.hashSync(password, 10) : undefined
        }
      });

      const [role] = await Promise.all([
        transaction.role.findUnique({ where: { name: CONST.DEFAULT_ROLE } }),
        transaction.userRole.deleteMany({
          where: { userId }
        })
      ]);

      await transaction.userRole.create({
        data: { userId, roleId: role?.id as string }
      });
    });

    if (email !== user.email) {
      return loginWithCredentials({
        email: result.data.email,
        password: result.data.password || String()
      });
    }

    return { success: false, message: CONST.PROFILE_UPDATED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function updateDoctorProfile(
  doctorId: string,
  data: Schema<typeof schemas.doctorProfileSchema>
) {
  try {
    const result = schemas.doctorProfileSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: CONST.INVALID_INPUTS };
    }

    const user = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        city: true,
        email: true,
        phone: true,
        image: true,
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
    if (!user) return { success: false, message: CONST.USER_NOT_FOUND };

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    });

    if (email !== user.email && emailExists) {
      return { success: false, message: CONST.EMAIL_REGISTERED };
    }

    await prisma.$transaction(async function (transaction) {
      let fileName;

      if (image?.size && user.image) await removeFile(user.image);
      if (image?.size) fileName = await saveFile(image);

      await transaction.user.update({
        where: { id: doctorId },
        data: {
          image: fileName,
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
              ? (daysOfVisit as P.Day[])
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
              create: utils.removeDuplicateTimes(timings)?.map(t => ({
                time: t.time,
                duration: t.duration
              })) as P.TimeSlot[]
            }
          }
        });
      }

      const [role] = await Promise.all([
        transaction.role.findUnique({ where: { name: CONST.DOCTOR_ROLE } }),
        transaction.userRole.deleteMany({
          where: { userId: doctorId }
        })
      ]);

      await transaction.userRole.create({
        data: { userId: doctorId, roleId: role?.id as string }
      });
    });

    if (email !== user.email) {
      return loginWithCredentials({
        email: result.data.email,
        password: result.data.password || String()
      });
    }

    return { success: false, message: CONST.PROFILE_UPDATED };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: CONST.USER_NOT_FOUND };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { date: true, timeSlot: { select: { time: true } } }
    });

    if (!appointment) {
      return { success: false, message: CONST.APPOINTMENT_NOT_FOUND };
    }

    const isInFuture = utils.isPastByTime(
      appointment?.date,
      appointment?.timeSlot.time,
      CONST.EXPIRES_AT * 1000
    );

    if (!isInFuture) {
      return { success: false, message: CONST.APPOINTMENT_ACTION_RESTRICTED };
    }

    const updated = await prisma.$transaction(async function (transaction) {
      return await transaction.appointment.update({
        where: { id },
        data: { status: status as P.AppointmentStatus },
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

    if (status === P.AppointmentStatus.CONFIRMED) {
      await Promise.all([
        sendEmail(
          updated.doctor.email as string,
          'Appointment Confirmed',
          Template.ConfirmAppointment(data)
        ),
        sendEmail(
          updated.patient.email as string,
          'Appointment Confirmed',
          Template.ConfirmAppointment(data)
        )
      ]);
    }

    if (status === P.AppointmentStatus.CANCELLED) {
      await Promise.all([
        sendEmail(
          updated.doctor.email as string,
          'Appointment Cancelled',
          Template.CancelAppointment(data)
        ),
        sendEmail(
          updated.patient.email as string,
          'Appointment Cancelled',
          Template.CancelAppointment(data)
        )
      ]);
    }

    revalidatePath('/');
    return {
      success: true,
      message:
        status === P.AppointmentStatus.CONFIRMED
          ? CONST.APPOINTMENT_CONFIRMED
          : CONST.APPOINTMENT_CANCELLED
    };
  } catch (error) {
    return utils.catchErrors(error as Error);
  }
}

export async function getMonthlyUserData(
  year: number = new Date().getFullYear()
) {
  const users = await prisma.user.findMany({
    select: { createdAt: true },
    where: {
      createdAt: {
        gte: dfns.startOfYear(new Date(year, 0, 1)),
        lt: dfns.endOfYear(new Date(year, 11, 31))
      }
    }
  });

  const data = CONST.MONTHS.map(month => ({ month, users: 0 }));
  users.forEach(user => data[user.createdAt.getMonth()].users++);

  return data;
}

export async function getMonthlyAppointmentData(
  userId: string,
  year: number = new Date().getFullYear()
) {
  const appointments = await prisma.appointment.findMany({
    select: { date: true, status: true, doctorId: true },
    where: {
      patientId: userId,
      date: {
        lt: dfns.endOfYear(new Date(year, 11, 31)),
        gte: dfns.startOfYear(new Date(year, 0, 1))
      }
    }
  });

  const data = CONST.MONTHS.map(month => ({ month, appointments: 0 }));

  appointments.forEach(appointment => {
    data[appointment.date.getMonth()].appointments++;
  });

  return data;
}

export async function getDashboardCards() {
  const now = new Date();

  const thisWeekEnd = dfns.endOfWeek(now, { weekStartsOn: 1 });
  const thisWeekStart = dfns.startOfWeek(now, { weekStartsOn: 1 });

  const prevWeekEnd = dfns.subWeeks(thisWeekEnd, 1);
  const prevWeekStart = dfns.subWeeks(thisWeekStart, 1);

  const thisMonthEnd = dfns.endOfMonth(now);
  const thisMonthStart = dfns.startOfMonth(now);
  const prevMonthEnd = dfns.subMonths(thisMonthEnd, 1);
  const prevMonthStart = dfns.subMonths(thisMonthStart, 1);

  const [appointments, users] = await Promise.all([
    prisma.appointment.findMany({ select: { date: true, status: true } }),
    prisma.user.findMany({
      select: {
        city: true,
        createdAt: true,
        UserRoles: { select: { role: { select: { name: true } } } }
      }
    })
  ]);

  const doctors = users.filter(u =>
    u.UserRoles.map(r => r.role.name).includes(CONST.DOCTOR_ROLE)
  );

  const appointmentsThisWeek = appointments.filter(a =>
    dfns.isWithinInterval(a.date, { start: thisWeekStart, end: thisWeekEnd })
  );

  const appointmentsPrevWeek = appointments.filter(a =>
    dfns.isWithinInterval(a.date, { start: prevWeekStart, end: prevWeekEnd })
  );

  const doctorsPrevMonth = doctors.filter(d =>
    dfns.isWithinInterval(d.createdAt, {
      start: prevMonthStart,
      end: prevMonthEnd
    })
  );

  const doctorsThisMonth = doctors.filter(d =>
    dfns.isWithinInterval(d.createdAt, {
      start: thisMonthStart,
      end: thisMonthEnd
    })
  );

  const pendingAppointments = appointments.filter(
    a => a.status === P.AppointmentStatus.PENDING
  );

  const pendingPrevWeek = appointmentsPrevWeek.filter(
    a => a.status === P.AppointmentStatus.PENDING
  );

  const cities = new Set(users.map(u => u.city).filter(Boolean));

  const prevCities = new Set(
    users
      .filter(u =>
        dfns.isWithinInterval(u.createdAt, {
          end: prevMonthEnd,
          start: prevMonthStart
        })
      )
      .map(u => u.city)
      .filter(Boolean)
  );

  const doctorChange = formatChange(
    doctorsThisMonth.length,
    doctorsPrevMonth.length
  );

  const pendingChange = formatChange(
    pendingPrevWeek.length,
    pendingAppointments.length
  );

  const appointmentChange = formatChange(
    appointmentsThisWeek.length,
    appointmentsPrevWeek.length
  );

  const cityChange = formatChange(cities.size, prevCities.size);

  return [
    {
      action: appointmentChange,
      summary: 'Week over week comparison',
      description: 'Appointments This Week',
      subtitle: 'Appointments scheduled this week',
      title: appointmentsThisWeek.length.toString()
    },
    {
      action: doctorChange,
      description: 'Active Doctors',
      title: doctors.length.toString(),
      summary: 'Change since last month',
      subtitle: `${doctors.length} doctors currently registered`
    },
    {
      action: pendingChange,
      summary: 'Pending bookings trend',
      description: 'Pending Appointments',
      title: pendingAppointments.length.toString(),
      subtitle: `${pendingAppointments.length} awaiting confirmation`
    },
    {
      action: cityChange,
      description: 'Cities Served',
      title: cities.size.toString(),
      summary: 'Change in service coverage',
      subtitle: Array.from(cities)
        .map(c => utils.capitalize(c as string))
        .join(', ')
    }
  ];
}

export async function getUserDashboardCards(userId: string) {
  const [specialities, appointments, doctors] = await Promise.all([
    prisma.speciality.findMany({ select: { name: true } }),
    prisma.appointment.findMany({
      where: { patientId: userId },
      select: { date: true, status: true }
    }),
    prisma.user.findMany({
      select: { name: true },
      where: { UserRoles: { some: { role: { name: CONST.DOCTOR_ROLE } } } }
    })
  ]);

  const upcoming = appointments.filter(
    a => isFuture(a.date) && a.status !== P.AppointmentStatus.CANCELLED
  );

  const completed = appointments.filter(
    a => dfns.isPast(a.date) && a.status === P.AppointmentStatus.CONFIRMED
  );

  return [
    {
      action: 'Updated',
      description: 'Available Doctors',
      title: doctors.length.toString(),
      summary: 'Available for consultation',
      subtitle: `${doctors.length} medical professionals`
    },
    {
      action: '+10%',
      title: completed.length.toString(),
      description: 'Completed Appointments',
      summary: 'Track your healthcare history',
      subtitle: `${completed.length} appointments completed`
    },
    {
      action: '+1',
      description: 'Available Specialties',
      title: specialities.length.toString(),
      summary: 'More expertise now available',
      subtitle: specialities.map(s => utils.capitalize(s.name)).join(', ')
    },
    {
      title: upcoming.length.toString(),
      description: 'Upcoming Appointments',
      summary: 'Stay prepared for your next visit',
      action: `+${((upcoming.length / (completed.length || 1)) * 100).toFixed(0)}%`,
      subtitle: `You have ${upcoming.length} upcoming appointment${upcoming.length !== 1 ? 's' : String()}`
    }
  ];
}
