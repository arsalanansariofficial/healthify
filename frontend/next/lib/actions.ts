'use server';

import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { z, ZodSchema } from 'zod';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import * as P from '@prisma/client';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';

import * as CONST from '@/lib/constants';
import * as schemas from '@/lib/schemas';
import { auth, signIn, unstable_update as update } from '@/auth';

type Schema<T extends ZodSchema> = z.infer<T>;

const dir = path.join(process.cwd(), CONST.USER_DIR);

const prisma = new P.PrismaClient().$extends({
  model: {
    user: {
      async deleteManyWithCleanup(args: P.Prisma.UserDeleteManyArgs) {
        const users = await prisma.user.findMany({
          where: args.where,
          select: { id: true, image: true }
        });

        const ids = users.map(user => user.id).filter(Boolean);

        await prisma.$transaction([
          prisma.timeSlot.deleteMany({ where: { userId: { in: ids } } }),
          prisma.user.deleteMany(args)
        ]);

        return users;
      },
      async deleteWithCleanup(args: P.Prisma.UserDeleteArgs) {
        const user = await prisma.user.findUnique({
          where: args.where,
          select: { id: true, image: true }
        });

        await prisma.timeSlot.deleteMany({
          where: { id: user?.id }
        });

        return prisma.user.delete(args);
      }
    }
  }
});

async function saveFile(file: File, fileName: string) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, fileName),
    Buffer.from(await file.arrayBuffer())
  );
}

async function generateToken(email: string) {
  return await prisma.$transaction(async function (transaction) {
    const token = await transaction.token.findUnique({ where: { email } });
    if (token) await transaction.token.delete({ where: { email } });
    return await transaction.token.create({
      data: { email, expires: new Date(Date.now() + 60 * 60 * 1000) }
    });
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    port: 465,
    secure: true,
    host: 'smtp.gmail.com',
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD
    }
  });

  return await transporter.sendMail({
    to,
    html,
    subject,
    from: process.env.MAILER_EMAIL
  });
}

async function loginWithCredentials({
  email,
  password
}: Schema<typeof schemas.loginSchema>) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      const token = await generateToken(email as string);

      const subject = 'Verify Your Email';
      const link = `http://localhost:3000/verify?token=${token.id}`;
      const html = `<p>Click <a href="${link}">here</a> to verify.</p>`;

      const emailSent = await sendEmail(email as string, subject, html);

      if (token && emailSent) {
        return {
          success: true,
          message: '🎉 Confirmation email sent.'
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
  revalidatePath('/');
}

export async function deleteSpecialities(ids: string[]) {
  await prisma.speciality.deleteMany({ where: { id: { in: ids } } });
  revalidatePath('/');
}

export async function deleteUser(id: string) {
  const user = await prisma.$transaction(async function (transaction) {
    return await transaction.user.deleteWithCleanup({ where: { id } });
  });

  if (user && user.image) await fs.unlink(path.join(dir, `${user?.image}`));
  revalidatePath('/');
}

export async function deleteUsers(ids: string[]) {
  const users = await prisma.$transaction(async function (transaction) {
    return await transaction.user.deleteManyWithCleanup({
      where: { id: { in: ids } }
    });
  });

  if (users?.length) {
    await Promise.all(
      users
        .filter(user => !!user.image)
        .map(user => fs.unlink(path.join(dir, `${user?.image}`)))
    );
  }

  revalidatePath('/');
}

export async function assignRoles(
  id: string,
  data: Schema<typeof schemas.userRolesSchema>
) {
  const result = schemas.userRolesSchema.safeParse(data);
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    await prisma.user.update({
      where: { id },
      data: { roles: { set: data.roles.map(r => ({ id: r })) } }
    });

    return { success: true, message: '🎉 Roles are assigned successfully.' };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function verifyEmail(email: string) {
  try {
    const user = await prisma.$transaction(async function (transaction) {
      const user = await transaction.user.findUnique({ where: { email } });
      if (!user) return { success: false, message: '⚠️ Invalid inputs!' };

      await transaction.user.update({
        where: { email },
        data: { emailVerified: user.emailVerified ? null : new Date() }
      });

      const token = await transaction.token.findUnique({
        where: { email: user.email as string }
      });

      if (token) await transaction.token.delete({ where: { id: token.id } });
      return user;
    });

    if (!user) return { success: false, message: '⚠️ User does not exist!' };
    revalidatePath('/');
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function assignPermissions({
  name,
  permissions
}: Schema<typeof schemas.rolePermissionsSchema>) {
  const result = schemas.rolePermissionsSchema.safeParse({ name, permissions });
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    const session = await auth();

    const user = await prisma.$transaction(async function (transaction) {
      await transaction.role.update({
        where: { name },
        data: { permissions: { set: permissions.map(p => ({ id: p })) } }
      });

      return await transaction.user.findUnique({
        where: { id: session?.user?.id },
        include: { roles: { include: { permissions: true } } }
      });
    });

    revalidatePath('/');
    await update({ user: { ...user, roles: user?.roles } });
    return {
      success: true,
      message: '🎉 All permissions are assigned successfully.'
    };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function updateSpeciality(
  id: string,
  { name }: Schema<typeof schemas.nameSchema>
) {
  const result = schemas.nameSchema.safeParse({ name });
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    await prisma.speciality.update({
      where: { id },
      data: { name: name.toUpperCase() }
    });

    revalidatePath('/');
    return {
      success: true,
      message: '🎉 Speciality updated successfully.'
    };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function addSpeciality({
  name
}: Schema<typeof schemas.nameSchema>) {
  const result = schemas.nameSchema.safeParse({ name });
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    await prisma.speciality.create({
      data: { name: result.data.name?.toUpperCase() as string }
    });

    revalidatePath('/');
    return {
      success: true,
      name: name.toUpperCase(),
      message: '🎉 Speciality added successfully!'
    };
  } catch {
    return { name, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function addRole(data: Schema<typeof schemas.roleSchema>) {
  const result = schemas.roleSchema.safeParse(data);
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    await prisma.role.create({
      data: { name: result.data.name.toUpperCase() }
    });

    return { ...data, success: true, message: '🎉 Role added successfully!' };
  } catch {
    return { ...data, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function addPermission(
  data: Schema<typeof schemas.permissionSchema>
) {
  const result = schemas.permissionSchema.safeParse(data);
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    await prisma.permission.create({
      data: { name: result.data.name.toUpperCase() }
    });

    return {
      ...data,
      success: true,
      message: '🎉 Permission added successfully.'
    };
  } catch {
    return { ...data, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function verifyToken(id: string) {
  try {
    const result = await prisma.$transaction(async function (transaction) {
      const token = await transaction.token.findUnique({ where: { id } });
      if (!token) return { success: false, message: '⚠️ Invalid inputs!' };

      const hasExpired = new Date(token.expires) < new Date();
      if (hasExpired) return { success: false, message: '⚠️ Invalid inputs!' };

      const user = await transaction.user.findUnique({
        where: { email: token.email }
      });

      if (!user) return { success: false, message: '⚠️ Invalid inputs!' };
      await transaction.user.update({
        where: { id: user.id },
        data: { email: token.email, emailVerified: new Date() }
      });

      await transaction.token.delete({ where: { id: token.id } });
      return { user, token, hasExpired };
    });

    if (!result?.token) {
      return { success: false, message: "⚠️ Token doesn't exist!" };
    }

    if (!result?.user) {
      return { success: false, message: "⚠️ Email doesn't exist!" };
    }

    if (result?.hasExpired) {
      return { success: false, message: '⚠️ Token has expired!' };
    }

    return {
      success: true,
      email: result.token.email,
      message: '🎉 Email verified successfully.'
    };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function login(data: Schema<typeof schemas.loginSchema>) {
  const email = data.email as string;
  const password = data.password as string;

  const result = schemas.loginSchema.safeParse({ email, password });
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  return await loginWithCredentials({ email, password });
}

export async function signup(data: Schema<typeof schemas.signupSchema>) {
  const result = schemas.signupSchema.safeParse(data);
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email as string }
    });

    if (user) return { success: false, message: '⚠️ Email already exist!' };

    await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({
        where: { name: 'USER' }
      });

      return await transaction.user.create({
        data: {
          name: result.data.name,
          email: result.data.email,
          roles: { connect: { id: role?.id } },
          password: await bcrypt.hash(result.data.password as string, 10)
        }
      });
    });
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }

  return loginWithCredentials(data);
}

export default async function seed() {
  try {
    await prisma.user.create({
      data: {
        name: 'Admin User',
        emailVerified: new Date(),
        email: 'admin.user@ansari.dashboard',
        password: await bcrypt.hash('admin.user', 10),
        roles: {
          create: [
            {
              name: 'ADMIN',
              permissions: { create: [{ name: 'VIEW:DASHBOARD' }] }
            }
          ]
        }
      }
    });

    return { success: true, message: '🎉 Database updated successfully.' };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function updatePassword({
  email,
  password
}: Schema<typeof schemas.loginSchema>) {
  const result = schemas.loginSchema.safeParse({ email, password });
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    await prisma.user.update({
      where: { email },
      data: { password: await bcrypt.hash(password, 10) }
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
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { email, success: false, message: "⚠️ Email doesn't exist!" };
    }

    const token = await generateToken(user.email as string);

    const subject = 'Reset Your Password';
    const link = `${CONST.HOST}/create-password?token=${token.id}`;
    const html = `<p>Click <a href="${link}">here</a> to reset your password`;

    await sendEmail(email, subject, html);
    return { email, success: true, message: '🎉 Confirmation email sent.' };
  } catch {
    return { email, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function updateUser(
  id: string,
  data: Schema<typeof schemas.userSchema>
) {
  const result = schemas.userSchema.safeParse(data);
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  try {
    const user = await prisma.$transaction(async function (transaction) {
      let existingUser;
      const { email, password } = result.data;
      const user = await transaction.user.findUnique({ where: { id } });

      if (email) {
        existingUser = await transaction.user.findUnique({ where: { email } });
      }

      if (email && email !== user?.email && existingUser)
        return { success: false, message: '⚠️ Invalid inputs!' };

      return await prisma.user.update({
        where: { id },
        data: {
          name: result.data.name,
          email: result.data.email,
          password: password ? await bcrypt.hash(password, 10) : undefined,
          emailVerified: result.data.emailVerified === 'yes' ? new Date() : null
        }
      });
    });

    if (!user) {
      return { success: false, message: '⚠️ Email already registered!' };
    }

    revalidatePath('/');
    return { success: true, message: '🎉 Profile updated successfully.' };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function addDoctor(data: Schema<typeof schemas.doctorSchema>) {
  const result = schemas.doctorSchema.safeParse(data);
  if (!result.success) return { success: false, message: '⚠️ Invalid inputs!' };

  const imageUUID = randomUUID();
  const image = result.data.image[0];
  const timings = result.data.timings;
  const specialities = result.data.specialities;
  const fileExtension = image?.type?.split('/').at(-1);

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (user) return { success: false, message: '⚠️ Email already exist!' };

    const created = await prisma.$transaction(async function (transaction) {
      let createTmings, connectSpecialities;

      const role = await transaction.role.findUnique({
        where: { name: 'USER' }
      });

      if (specialities.length) {
        connectSpecialities = {
          connect: specialities?.map(id => ({ id }))
        };
      }

      if (timings.length) {
        createTmings = {
          create: timings?.map(t => ({
            time: t.time,
            duration: t.duration
          })) as P.TimeSlot[]
        };
      }

      return await transaction.user.create({
        data: {
          timings: createTmings,
          name: result.data.name,
          city: result.data.city,
          email: result.data.email,
          phone: result.data.phone,
          gender: result.data.gender,
          specialities: connectSpecialities,
          experience: result.data.experience,
          roles: { connect: { id: role?.id } },
          daysOfVisit: (result.data.daysOfVisit as P.Day[]) || undefined,
          image: image.size ? `${imageUUID}.${fileExtension}` : undefined,
          password: await bcrypt.hash(result.data.password as string, 10)
        }
      });
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
