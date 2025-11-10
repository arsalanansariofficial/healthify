'use server';

import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcrypt-mini';
import { z, ZodSchema } from 'zod';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import * as P from '@prisma/client';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import * as CONST from '@/lib/constants';
import * as schemas from '@/lib/schemas';
import { auth, signIn, unstable_update as update } from '@/auth';
import { catchAuthError, catchErrors, removeDuplicateTimes } from '@/lib/utils';

type Schema<T extends ZodSchema> = z.infer<T>;

const dir = path.join(process.cwd(), CONST.USER_DIR);

async function saveFile(file: File, fileName: string) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, fileName),
    Buffer.from(await file.arrayBuffer())
  );
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

      const emailSent = await sendEmail(
        email,
        `${CONST.HOST}/verify?token=${token.id}`,
        `<p>Click <a href="${CONST.HOST}/verify?token=${token.id}">here</a> to verify your email.</p>`
      );

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
    return catchAuthError(error as Error);
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
    if (user && user.image) await fs.unlink(path.join(dir, `${user?.image}`));
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
        .map(user => fs.unlink(path.join(dir, `${user?.image}`)))
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return { email: undefined, ...catchErrors(error as Error) };
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return catchErrors(error as Error);
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
    return { email, ...catchErrors(error as Error) };
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
    return catchErrors(error as Error);
  }
}

export async function addDoctor(data: Schema<typeof schemas.doctorSchema>) {
  const result = schemas.doctorSchema.safeParse(data);
  if (!result.success) return { success: false, message: CONST.INVALID_INPUTS };

  const imageUUID = randomUUID();
  const timings = result.data.timings;
  const specialities = result.data.specialities;
  const image = result.data?.image && result.data.image[0];
  const fileExtension = image?.type?.split(CONST.HOME).at(-1);

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (user) return { success: false, message: CONST.EMAIL_REGISTERED };

    const created = await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({
        where: { name: CONST.DOCTOR_ROLE }
      });

      const user = await transaction.user.create({
        data: {
          name: result.data.name,
          city: result.data.city,
          email: result.data.email,
          phone: result.data.phone,
          gender: result.data.gender,
          experience: result.data.experience,
          daysOfVisit: (result.data.daysOfVisit as P.Day[]) || undefined,
          password: bcrypt.hashSync(result.data.password as string, 10),
          image: image?.size ? `${imageUUID}.${fileExtension}` : undefined,
          timings: {
            create: removeDuplicateTimes(timings)?.map(t => ({
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

      return user;
    });

    if (created && image?.size) {
      await saveFile(image, `${imageUUID}.${fileExtension}`);
    }
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
    return catchErrors(error as Error);
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

    const imageUUID = randomUUID();
    const image = result.data?.image && result.data.image[0];
    const fileExtension = image?.type?.split(CONST.HOME).at(-1);

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
      const updated = await transaction.user.update({
        where: { id: userId },
        data: {
          name: result.data.name,
          email: email !== user.email ? email : undefined,
          city: city && city !== user.city ? city : undefined,
          phone: phone && phone !== user.phone ? phone : undefined,
          gender: gender && gender !== user.gender ? gender : undefined,
          password: password ? bcrypt.hashSync(password, 10) : undefined,
          image: image?.size ? `${imageUUID}.${fileExtension}` : undefined
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

      if (image?.size && user.image) {
        await fs.unlink(path.join(dir, `${user.image}`));
      }

      if (updated && image?.size) {
        await saveFile(image, `${imageUUID}.${fileExtension}`);
      }
    });

    if (email !== user.email) {
      return loginWithCredentials({
        email: result.data.email,
        password: result.data.password || String()
      });
    }

    return { success: false, message: CONST.PROFILE_UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
