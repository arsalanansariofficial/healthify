'use server';

import bcrypt from 'bcrypt-mini';
import { z, ZodSchema } from 'zod';
import nodemailer from 'nodemailer';
import { revalidatePath } from 'next/cache';

import {
  isPast,
  isFuture,
  subWeeks,
  endOfWeek,
  endOfYear,
  subMonths,
  endOfMonth,
  startOfWeek,
  startOfYear,
  startOfMonth,
  isWithinInterval
} from 'date-fns';

import prisma from '@/lib/prisma';
import { VerifyEmail } from '@/components/email/account/email';
import { auth, signIn, unstable_update as update } from '@/auth';
import { AppointmentStatus, Day, Gender, TimeSlot } from '@prisma/client';

import {
  CancelAppointment,
  ConfirmAppointment
} from '@/components/email/appointment/email';

import {
  capitalize,
  catchErrors,
  formatChange,
  isPastByTime,
  catchAuthError,
  removeDuplicateTimes
} from '@/lib/utils';

import {
  bioSchema,
  nameSchema,
  roleSchema,
  userSchema,
  loginSchema,
  emailSchema,
  signupSchema,
  doctorSchema,
  userRolesSchema,
  permissionSchema,
  appointmentSchema,
  userProfileSchema,
  doctorProfileSchema,
  rolePermissionsSchema
} from '@/lib/schemas';

import {
  HOME,
  HOST,
  MONTHS,
  DASHBOARD,
  ADMIN_NAME,
  ADMIN_ROLE,
  EXPIRES_AT,
  ROLE_ADDED,
  SMTP_EMAIL,
  ADMIN_EMAIL,
  DOCTOR_ROLE,
  DEFAULT_ROLE,
  EMAIL_FAILED,
  CONFIRM_EMAIL,
  SMTP_PASSWORD,
  TOKEN_EXPIRED,
  UN_AUTHORIZED,
  USER_NOT_FOUND,
  ADMIN_PASSWORD,
  EMAIL_VERIFIED,
  INVALID_INPUTS,
  ROLES_ASSIGNED,
  SMTP_HOST_NAME,
  EMAIL_NOT_FOUND,
  PROFILE_UPDATED,
  TOKEN_NOT_FOUND,
  DATABASE_UPDATED,
  EMAIL_REGISTERED,
  PERMISSION_ADDED,
  SMTP_PORT_NUMBER,
  SPECIALITY_ADDED,
  INVALID_TIME_SLOT,
  APPOINTMENT_EXISTS,
  DEFAULT_PERMISSION,
  SPECIALITY_UPDATED,
  APPOINTMENT_CREATED,
  TOKEN_NOT_GENERATED,
  PERMISSIONS_ASSIGNED,
  APPOINTMENT_CANCELLED,
  APPOINTMENT_CONFIRMED,
  APPOINTMENT_NOT_FOUND,
  APPOINTMENT_ACTION_RESTRICTED
} from '@/lib/constants';

type Schema<T extends ZodSchema> = z.infer<T>;

async function removeFile(slug: string) {
  const result = await fetch(`${HOST}/api/upload/${slug}`, {
    method: 'DELETE'
  });

  const response = await result.json();
  if (!response.success) throw new Error(response.message);
}

async function saveFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const result = await fetch(`${HOST}/api/upload`, {
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
      data: { userId, expires: new Date(Date.now() + EXPIRES_AT * 1000) }
    });
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    secure: true,
    host: SMTP_HOST_NAME,
    port: SMTP_PORT_NUMBER,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD
    }
  });

  return await transporter.sendMail({
    to,
    html,
    subject,
    from: SMTP_EMAIL
  });
}

export async function loginWithCredentials(
  { email, password }: Schema<typeof loginSchema>,
  redirectTo?: string
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: EMAIL_NOT_FOUND };
    }

    if (!user.emailVerified) {
      const token = await generateToken(user.id as string);

      if (!token) {
        return { success: false, message: TOKEN_NOT_GENERATED };
      }

      const html = VerifyEmail({ data: { token: token.id } });
      const subject = `${HOST}/verify?token=${token.id}`;
      const emailSent = await sendEmail(email, subject, html);

      if (!emailSent) {
        return { success: false, message: EMAIL_FAILED };
      }

      return { success: true, message: CONFIRM_EMAIL };
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: redirectTo || DASHBOARD
    });
  } catch (error) {
    return catchAuthError(error as Error);
  }
}

export async function deleteSpeciality(id: string) {
  await prisma.speciality.delete({ where: { id } });
  revalidatePath(HOME);
}

export async function deleteSpecialities(ids: string[]) {
  await prisma.speciality.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(HOME);
}

export async function deleteUser(id: string) {
  await prisma.$transaction(async function (transaction) {
    const user = await transaction.user.delete({ where: { id } });
    if (user && !user.hasOAuth && user.image) await removeFile(user.image);
  });

  revalidatePath(HOME);
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
        .map(user => removeFile(user?.image as string))
    ]);
  });

  revalidatePath(HOME);
}

export async function assignRoles(
  id: string,
  data: Schema<typeof userRolesSchema>
) {
  const result = userRolesSchema.safeParse(data);
  if (!result.success) return { success: false, message: INVALID_INPUTS };

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
    return { success: true, message: ROLES_ASSIGNED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function verifyEmail(email: string) {
  try {
    const user = await prisma.$transaction(async function (transaction) {
      const user = await transaction.user.findUnique({ where: { email } });
      if (!user) return { success: false, message: INVALID_INPUTS };

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

    if (!user) return { success: false, message: USER_NOT_FOUND };
    revalidatePath(HOME);
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function assignPermissions({
  name,
  permissions
}: Schema<typeof rolePermissionsSchema>) {
  const result = rolePermissionsSchema.safeParse({ name, permissions });
  if (!result.success) return { success: false, message: INVALID_INPUTS };

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
      where: { roleId: { in: session?.user?.roles?.map(r => r.id) } }
    });

    await update({
      user: { ...session?.user, permissions: permits.map(rp => rp.permission) }
    });

    revalidatePath(HOME);
    return { success: true, message: PERMISSIONS_ASSIGNED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateSpeciality(
  id: string,
  { name }: Schema<typeof nameSchema>
) {
  const result = nameSchema.safeParse({ name });
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    await prisma.speciality.update({
      where: { id },
      data: { name: name.toUpperCase() }
    });

    revalidatePath(HOME);
    return {
      success: true,
      message: SPECIALITY_UPDATED
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addSpeciality({ name }: Schema<typeof nameSchema>) {
  const result = nameSchema.safeParse({ name });
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    await prisma.speciality.create({
      data: { name: result.data.name?.toUpperCase() as string }
    });

    revalidatePath(HOME);
    return {
      success: true,
      name: name.toUpperCase(),
      message: SPECIALITY_ADDED
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addRole(data: Schema<typeof roleSchema>) {
  const result = roleSchema.safeParse(data);
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    await prisma.role.create({
      data: { name: result.data.name.toUpperCase() }
    });

    return { ...data, success: true, message: ROLE_ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addPermission(data: Schema<typeof permissionSchema>) {
  const result = permissionSchema.safeParse(data);
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    await prisma.permission.create({
      data: { name: result.data.name.toUpperCase() }
    });

    return {
      ...data,
      success: true,
      message: PERMISSION_ADDED
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function verifyToken(id: string) {
  try {
    const result = await prisma.$transaction(async function (transaction) {
      const token = await transaction.token.findUnique({ where: { id } });
      if (!token) return { success: false, message: INVALID_INPUTS };

      const hasExpired = new Date(token.expires) < new Date();
      if (hasExpired) return { success: false, message: INVALID_INPUTS };

      const user = await transaction.user.findUnique({
        where: { id: token.userId }
      });

      if (!user) return { success: false, message: INVALID_INPUTS };
      await transaction.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });

      await transaction.token.delete({ where: { id: token.id } });
      return { user, token, hasExpired };
    });

    if (!result?.token) {
      return { success: false, message: TOKEN_NOT_FOUND };
    }

    if (!result?.user) {
      return { success: false, message: EMAIL_NOT_FOUND };
    }

    if (result?.hasExpired) {
      return { success: false, message: TOKEN_EXPIRED };
    }

    return {
      success: true,
      email: result.user.email,
      message: EMAIL_VERIFIED
    };
  } catch (error) {
    return { email: undefined, ...catchErrors(error as Error) };
  }
}

export async function login(
  data: Schema<typeof loginSchema>,
  redirectTo?: string
) {
  const email = data.email as string;
  const password = data.password as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  return await loginWithCredentials({ email, password }, redirectTo);
}

export async function signup(
  data: Schema<typeof signupSchema>,
  redirectTo?: string
) {
  const result = signupSchema.safeParse(data);
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email as string }
    });

    if (user) return { success: false, message: EMAIL_REGISTERED };

    await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({
        where: { name: DEFAULT_ROLE }
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
    return catchErrors(error as Error);
  }

  return loginWithCredentials(data, redirectTo);
}

export async function seed() {
  try {
    await prisma.$transaction(async function (transaction) {
      const [role, permission, user] = await Promise.all([
        await transaction.role.create({
          data: { name: ADMIN_ROLE }
        }),
        transaction.permission.create({
          data: { name: DEFAULT_PERMISSION }
        }),
        transaction.user.create({
          data: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            emailVerified: new Date(),
            password: bcrypt.hashSync(ADMIN_PASSWORD, 10)
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

    return { success: true, message: DATABASE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updatePassword({
  email,
  password
}: Schema<typeof loginSchema>) {
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) return { success: false, message: INVALID_INPUTS };

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

export async function forgetPassword({ email }: Schema<typeof emailSchema>) {
  const result = emailSchema.safeParse({ email });
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { email, success: false, message: EMAIL_NOT_FOUND };
    }

    const token = await generateToken(user.id as string);
    const emailSent = await sendEmail(
      email,
      'Reset Your Password',
      `<p>Click <a href="${HOST}/create-password?token=${token.id}">here</a> to reset your password`
    );

    if (!emailSent) return { success: false, message: EMAIL_FAILED };
    return { email, success: true, message: CONFIRM_EMAIL };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateUser(id: string, data: Schema<typeof userSchema>) {
  const result = userSchema.safeParse(data);
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    const user = await prisma.$transaction(async function (transaction) {
      let existingUser;
      const { email, password } = result.data;
      const user = await transaction.user.findUnique({ where: { id } });

      if (email) {
        existingUser = await transaction.user.findUnique({ where: { email } });
      }

      if (email && email !== user?.email && existingUser)
        return { success: false, message: INVALID_INPUTS };

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
      return { success: false, message: EMAIL_REGISTERED };
    }

    revalidatePath(HOME);
    return { success: true, message: PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addDoctor(data: Schema<typeof doctorSchema>) {
  const result = doctorSchema.safeParse(data);
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  const timings = result.data.timings;
  const specialities = result.data.specialities;
  const image = result.data.image && result.data.image[0];

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (user) return { success: false, message: EMAIL_REGISTERED };

    await prisma.$transaction(async function (transaction) {
      let fileName;
      if (image?.size) fileName = await saveFile(image);

      const role = await transaction.role.findUnique({
        where: { name: DOCTOR_ROLE }
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
  data: Schema<typeof appointmentSchema>
) {
  const result = appointmentSchema.safeParse(data);
  if (!result.success) return { success: false, message: INVALID_INPUTS };

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: USER_NOT_FOUND };
    }

    const time = await prisma.timeSlot.findUnique({
      select: { time: true },
      where: { id: result.data.time }
    });

    if (
      !time ||
      !isPastByTime(result.data.date, time.time, EXPIRES_AT * 1000)
    ) {
      return { success: false, message: INVALID_TIME_SLOT };
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
      return { success: false, message: APPOINTMENT_EXISTS };
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

    return { success: true, message: APPOINTMENT_CREATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateBio(id: string, data: Schema<typeof bioSchema>) {
  try {
    const result = bioSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: INVALID_INPUTS };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { bio: true }
    });

    if (!user) {
      return { success: false, message: UN_AUTHORIZED };
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

    return { success: true, message: PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateUserProfile(
  userId: string,
  data: Schema<typeof userProfileSchema>
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: UN_AUTHORIZED };
    }

    const result = userProfileSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: INVALID_INPUTS };
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

    if (!user) return { success: false, message: USER_NOT_FOUND };

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    });

    if (email !== user.email && emailExists) {
      return { success: false, message: EMAIL_REGISTERED };
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
        transaction.role.findUnique({ where: { name: DEFAULT_ROLE } }),
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

    return { success: true, message: PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateDoctorProfile(
  doctorId: string,
  data: Schema<typeof doctorProfileSchema>
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: UN_AUTHORIZED };
    }

    const result = doctorProfileSchema.safeParse(data);

    if (!result.success) {
      return { success: false, message: INVALID_INPUTS };
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
    if (!user) return { success: false, message: USER_NOT_FOUND };

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    });

    if (email !== user.email && emailExists) {
      return { success: false, message: EMAIL_REGISTERED };
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
        transaction.role.findUnique({ where: { name: DOCTOR_ROLE } }),
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

    return { success: false, message: PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: USER_NOT_FOUND };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { date: true, timeSlot: { select: { time: true } } }
    });

    if (!appointment) {
      return { success: false, message: APPOINTMENT_NOT_FOUND };
    }

    const isInFuture = isPastByTime(
      appointment?.date,
      appointment?.timeSlot.time,
      EXPIRES_AT * 1000
    );

    if (!isInFuture) {
      return { success: false, message: APPOINTMENT_ACTION_RESTRICTED };
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
          ? APPOINTMENT_CONFIRMED
          : APPOINTMENT_CANCELLED
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function getMonthlyUserData(
  year: number = new Date().getFullYear()
) {
  const users = await prisma.user.findMany({
    select: { createdAt: true },
    where: {
      createdAt: {
        gte: startOfYear(new Date(year, 0, 1)),
        lt: endOfYear(new Date(year, 11, 31))
      }
    }
  });

  const data = MONTHS.map(month => ({ month, users: 0 }));
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
        lt: endOfYear(new Date(year, 11, 31)),
        gte: startOfYear(new Date(year, 0, 1))
      }
    }
  });

  const data = MONTHS.map(month => ({ month, appointments: 0 }));

  appointments.forEach(appointment => {
    data[appointment.date.getMonth()].appointments++;
  });

  return data;
}

export async function getDashboardCards() {
  const now = new Date();

  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });

  const prevWeekEnd = subWeeks(thisWeekEnd, 1);
  const prevWeekStart = subWeeks(thisWeekStart, 1);

  const thisMonthEnd = endOfMonth(now);
  const thisMonthStart = startOfMonth(now);
  const prevMonthEnd = subMonths(thisMonthEnd, 1);
  const prevMonthStart = subMonths(thisMonthStart, 1);

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
    u.UserRoles.map(r => r.role.name).includes(DOCTOR_ROLE)
  );

  const appointmentsThisWeek = appointments.filter(a =>
    isWithinInterval(a.date, { start: thisWeekStart, end: thisWeekEnd })
  );

  const appointmentsPrevWeek = appointments.filter(a =>
    isWithinInterval(a.date, { start: prevWeekStart, end: prevWeekEnd })
  );

  const doctorsPrevMonth = doctors.filter(d =>
    isWithinInterval(d.createdAt, {
      start: prevMonthStart,
      end: prevMonthEnd
    })
  );

  const doctorsThisMonth = doctors.filter(d =>
    isWithinInterval(d.createdAt, {
      start: thisMonthStart,
      end: thisMonthEnd
    })
  );

  const pendingAppointments = appointments.filter(
    a => a.status === AppointmentStatus.pending
  );

  const pendingPrevWeek = appointmentsPrevWeek.filter(
    a => a.status === AppointmentStatus.pending
  );

  const cities = new Set(users.map(u => u.city).filter(Boolean));

  const prevCities = new Set(
    users
      .filter(u =>
        isWithinInterval(u.createdAt, {
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
        .map(c => capitalize(c as string))
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
      where: { UserRoles: { some: { role: { name: DOCTOR_ROLE } } } }
    })
  ]);

  const upcoming = appointments.filter(
    a => isFuture(a.date) && a.status !== AppointmentStatus.cancelled
  );

  const completed = appointments.filter(
    a => isPast(a.date) && a.status === AppointmentStatus.confirmed
  );

  return [
    {
      description: 'Available Doctors',
      title: doctors.length.toString(),
      summary: 'Available for consultation',
      subtitle: `${doctors.length} medical professional${doctors.length !== 1 ? 's' : String()}`,
      action: doctors.length
        ? `+${((doctors.length / doctors.length) * 100).toFixed(0)}%`
        : '+0%'
    },
    {
      title: completed.length.toString(),
      description: 'Completed Appointments',
      summary: 'Track your healthcare history',
      subtitle: `${completed.length} appointment${completed.length !== 1 ? 's' : ''} completed`,
      action: completed.length
        ? `+${((completed.length / (appointments.length || 1)) * 100).toFixed(0)}%`
        : '+0%'
    },
    {
      description: 'Available Specialties',
      title: specialities.length.toString(),
      summary: 'More expertise now available',
      action: specialities.length ? `+${specialities.length}` : '+0',
      subtitle: specialities.map(s => capitalize(s.name)).join(', ')
    },
    {
      title: upcoming.length.toString(),
      description: 'Upcoming Appointments',
      summary: 'Stay prepared for your next visit',
      subtitle: `You have ${upcoming.length} upcoming appointment${upcoming.length !== 1 ? 's' : String()}`,
      action: upcoming.length
        ? `+${((upcoming.length / (appointments.length || 1)) * 100).toFixed(0)}%`
        : '+0%'
    }
  ];
}
