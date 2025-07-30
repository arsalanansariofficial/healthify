'use server';

import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcrypt-mini';
import { z, ZodSchema } from 'zod';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import * as P from '@prisma/client';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import * as CONST from '@/lib/constants';
import * as schemas from '@/lib/schemas';
import { removeDuplicateTimes } from '@/lib/utils';
import { auth, signIn, unstable_update as update } from '@/auth';

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

async function loginWithCredentials({
  email,
  password
}: Schema<typeof schemas.loginSchema>) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      const token = await generateToken(user.id as string);

      const subject = 'Verify Your Email';
      const link = `${CONST.HOST}/verify?token=${token.id}`;
      const html = `<p>Click <a href="${link}">here</a> to verify.</p>`;

      const emailSent = await sendEmail(email as string, subject, html);

      if (token && emailSent) {
        return {
          success: true,
          message: CONST.CONFIRM_EMAIL
        };
      }

      return {
        success: false,
        message: CONST.SERVER_ERROR_MESSAGE
      };
    }

    await signIn('credentials', {
      email: email,
      redirectTo: CONST.DASHBOARD,
      password: password
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            message: '⚠️ Invalid email or password!'
          };

        default:
          return {
            success: false,
            message: CONST.SERVER_ERROR_MESSAGE
          };
      }
    }

    throw error;
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
  const user = await prisma.user.delete({ where: { id } });
  if (user && user.image) await fs.unlink(path.join(dir, `${user?.image}`));
  revalidatePath(CONST.HOME);
}

export async function deleteUsers(ids: string[]) {
  const [users, count] = await prisma.$transaction(
    async function (transaction) {
      return [
        await transaction.user.findMany({ where: { id: { in: ids } } }),
        await transaction.user.deleteMany({ where: { id: { in: ids } } })
      ];
    }
  );

  if (count) {
    await Promise.all(
      users
        .filter(user => !!user.image)
        .map(user => fs.unlink(path.join(dir, `${user?.image}`)))
    );
  }

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
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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

    const { roles, permits } = await prisma.$transaction(
      async function (transaction) {
        const role = await transaction.role.findUnique({ where: { name } });
        if (!role) return { roles: [], permits: [] };

        const deletePermissions = transaction.rolePermission.deleteMany({
          where: { roleId: role.id }
        });

        const addPermissions = transaction.rolePermission.createMany({
          data: permissions.map(p => ({ roleId: role.id, permissionId: p }))
        });

        const getRoles = transaction.userRole.findMany({
          select: { id: true, role: true },
          where: { userId: session?.user?.id }
        });

        const getPermissions = transaction.rolePermission.findMany({
          where: { roleId: role.id },
          select: { id: true, permission: true }
        });

        if (!permissions.length) {
          const [, roles, permits] = await Promise.all([
            deletePermissions,
            getRoles,
            getPermissions
          ]);

          return {
            roles: roles.map(r => r.role),
            permits: permits.map(p => p.permission)
          };
        }

        const [, , roles, permits] = await Promise.all([
          deletePermissions,
          addPermissions,
          getRoles,
          getPermissions
        ]);

        return {
          roles: roles.map(r => r.role),
          permits: permits.map(p => p.permission)
        };
      }
    );

    await update({
      user: { ...session?.user, roles: roles, permissions: permits }
    });

    revalidatePath(CONST.HOME);
    return { success: true, message: CONST.PERMISSIONS_ASSIGNED };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
  } catch {
    return { name, success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
  } catch {
    return { ...data, success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
  } catch {
    return { ...data, success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
            password: await bcrypt.hashSync(CONST.ADMIN_PASSWORD, 10)
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
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
      data: { password: await bcrypt.hashSync(password, 10) }
    });
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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

    const subject = 'Reset Your Password';
    const link = `${CONST.HOST}/create-password?token=${token.id}`;
    const html = `<p>Click <a href="${link}">here</a> to reset your password`;

    await sendEmail(email, subject, html);
    return { email, success: true, message: CONST.CONFIRM_EMAIL };
  } catch {
    return { email, success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
          password: password ? await bcrypt.hashSync(password, 10) : undefined,
          emailVerified: result.data.emailVerified === 'yes' ? new Date() : null
        }
      });
    });

    if (!user) {
      return { success: false, message: CONST.EMAIL_REGISTERED };
    }

    revalidatePath(CONST.HOME);
    return { success: true, message: CONST.PROFILE_UPDATED };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
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
        where: { name: CONST.DEFAULT_ROLE }
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
          password: await bcrypt.hashSync(result.data.password as string, 10),
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
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }

  return loginWithCredentials({
    email: result.data.email,
    password: result.data.password
  });
}
