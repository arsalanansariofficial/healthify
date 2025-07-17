'use server';

import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import * as P from '@prisma/client';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';

import * as CONST from '@/lib/constants';
import * as schemas from '@/lib/schemas';
import { auth, signIn, unstable_update as update } from '@/auth';

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

export type FormState = {
  name?: string;
  role?: string;
  city?: string;
  email?: string;
  phone?: string;
  image?: string;
  gender?: string;
  message?: string;
  success?: boolean;
  password?: string;
  permission?: string;
  experience?: number;
  emailVerified?: string;
  daysOfVisit?: string[];
  specialities?: string[];
  timings?: { time: `${number}:${number}:${number}`; duration: number }[];
  errors?: {
    city?: string[];
    name?: string[];
    role?: string[];
    phone?: string[];
    image?: string[];
    email?: string[];
    gender?: string[];
    timings?: string[];
    password?: string[];
    experience?: string[];
    permission?: string[];
    daysOfVisit?: string[];
    specialities?: string[];
    emailVerified?: string[];
  };
};

const formSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email should be valid.' })
    .optional()
    .nullable(),
  emailVerified: z.enum(['yes', 'no']).optional().nullable(),
  password: z
    .string()
    .min(1, { message: 'Password should be valid.' })
    .optional()
    .nullable(),
  experience: z.coerce
    .number()
    .min(1, { message: 'Experience should be valid.' })
    .optional()
    .nullable(),
  specialities: z
    .array(z.string().min(1, { message: 'Id should be valid.' }))
    .optional()
    .nullable(),
  daysOfVisit: z
    .array(z.string().toUpperCase().min(1, { message: 'Day should be valid.' }))
    .optional()
    .nullable(),
  name: z
    .string()
    .min(3, { message: 'Should be atleast 3 characters.' })
    .optional()
    .nullable(),
  gender: z
    .enum(['male', 'female'], { message: 'Gender should be valid.' })
    .optional()
    .nullable(),
  role: z
    .string()
    .toUpperCase()
    .min(1, { message: 'Role should be valid.' })
    .optional()
    .nullable(),
  city: z
    .string()
    .toUpperCase()
    .min(1, { message: 'City should be valid.' })
    .optional()
    .nullable(),
  image: z
    .string()
    .min(5, { message: 'Name should be atleast 5 characters.' })
    .nullable()
    .optional(),
  permission: z
    .string()
    .toUpperCase()
    .min(1, { message: 'Permission should be valid.' })
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, { message: 'Invalid phone number format.' })
    .optional()
    .nullable(),
  timings: z
    .array(
      z.object({
        duration: z.number().positive({
          message: 'Duration must be a positive number'
        }),
        time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
          message: 'Invalid time format. Expected HH:MM:SS (24-hour format)'
        })
      })
    )
    .optional()
    .nullable()
});

async function saveFile(file: File, fileName: string) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, fileName),
    Buffer.from(await file.arrayBuffer())
  );
}

async function generateToken(email: string) {
  const token = await prisma.token.findUnique({ where: { email } });
  if (token) await prisma.token.delete({ where: { email } });
  return await prisma.token.create({
    data: { email, expires: new Date(Date.now() + 60 * 60 * 1000) }
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

async function loginWithCredentials(response: FormState) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: response.email }
    });

    if (user && !user.emailVerified) {
      const token = await generateToken(response.email as string);

      const subject = 'Verify Your Email';
      const link = `http://localhost:3000/verify?token=${token.id}`;
      const html = `<p>Click <a href="${link}">here</a> to verify.</p>`;

      const emailSent = await sendEmail(
        response.email as string,
        subject,
        html
      );

      if (token && emailSent) {
        return {
          ...response,
          success: true,
          message: '🎉 Confirmation email sent.'
        };
      }

      return {
        ...response,
        success: false,
        message: CONST.SERVER_ERROR_MESSAGE
      };
    }

    await signIn('credentials', {
      email: response.email,
      redirectTo: CONST.DASHBOARD,
      password: response.password
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            ...response,
            success: false,
            message: '⚠️ Invalid email or password!'
          };

        default:
          return {
            ...response,
            success: false,
            message: CONST.SERVER_ERROR_MESSAGE
          };
      }
    }

    throw error;
  }
}

export async function deleteUser(id: string) {
  await prisma.$transaction(async function (transaction) {
    const user = await transaction.user.deleteWithCleanup({ where: { id } });
    if (user && user.image) await fs.unlink(path.join(dir, `${user?.image}`));
    revalidatePath('/');
  });
}

export async function deleteUsers(ids: string[]) {
  await prisma.$transaction(async function (transaction) {
    const users = await transaction.user.deleteManyWithCleanup({
      where: { id: { in: ids } }
    });
    await Promise.all(
      users
        .filter(user => !!user.image)
        .map(user => fs.unlink(path.join(dir, `${user?.image}`)))
    );
    revalidatePath('/');
  });
}

export async function deleteSpeciality(id: string) {
  await prisma.speciality.delete({ where: { id } });
  revalidatePath('/');
}

export async function deleteSpecialities(ids: string[]) {
  await prisma.speciality.deleteMany({ where: { id: { in: ids } } });
  revalidatePath('/');
}

export async function assignRoles(formData: {
  id: string;
  roles: P.Role[];
}): Promise<FormState | undefined> {
  try {
    await prisma.user.update({
      where: { id: formData.id },
      data: { roles: { set: formData.roles.map(({ id }) => ({ id })) } }
    });

    return { success: true, message: '🎉 Roles are assigned successfully.' };
  } catch {
    return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function verifyEmail(
  email: string
): Promise<FormState | undefined> {
  try {
    const user = await prisma.$transaction(async function (transaction) {
      const user = await transaction.user.findUnique({ where: { email } });
      if (!user) return;

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

export async function assignPermissions(formData: {
  role: string;
  permissions: P.Permission[];
}): Promise<FormState | undefined> {
  try {
    const session = await auth();

    const user = await prisma.$transaction(async function (transaction) {
      await transaction.role.update({
        where: { name: formData.role },
        data: {
          permissions: { set: formData.permissions.map(({ id }) => ({ id })) }
        }
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
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const name = formData.get('name') as string;
  const result = formSchema.safeParse({ name });

  if (!result.success) {
    return { name, errors: result.error.flatten().fieldErrors };
  }

  await prisma.speciality.update({ where: { id }, data: { name } });

  revalidatePath('/');
  return {
    name,
    success: true,
    emailVerified: 'yes',
    message: '🎉 Speciality updated successfully.'
  };
}

export async function addSpeciality(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const name = formData.get('name') as string;
  const result = formSchema.safeParse({ name });

  if (!result.success) {
    return { name, errors: result.error.flatten().fieldErrors };
  }

  try {
    await prisma.speciality.create({
      data: { name: result.data.name?.toUpperCase() as string }
    });

    revalidatePath('/');
    return {
      name,
      success: true,
      message: '🎉 Speciality added successfully!'
    };
  } catch {
    return { name, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function addRole(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const role = formData.get('role') as string;
  const result = formSchema.safeParse({ role });

  if (!result.success) {
    return { role, errors: result.error.flatten().fieldErrors };
  }

  try {
    await prisma.role.create({ data: { name: result.data.role as string } });
    return { role, success: true, message: '🎉 Role added successfully!' };
  } catch {
    return { role, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function addPermission(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const permission = formData.get('permission') as string;
  const result = formSchema.safeParse({ permission });

  if (!result.success) {
    return { permission, errors: result.error.flatten().fieldErrors };
  }

  try {
    await prisma.permission.create({
      data: { name: result.data.permission as string }
    });

    return {
      permission,
      success: true,
      message: '🎉 Permission added successfully.'
    };
  } catch {
    return { permission, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }
}

export async function verifyToken(id: string): Promise<FormState> {
  try {
    const result = await prisma.$transaction(async function (transaction) {
      const token = await transaction.token.findUnique({ where: { id } });
      if (!token) return;

      const hasExpired = new Date(token.expires) < new Date();
      if (hasExpired) return;

      const user = await transaction.user.findUnique({
        where: { email: token.email }
      });

      if (!user) return;
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

export async function login(
  data: z.infer<typeof schemas.loginSchema>
): Promise<FormState | undefined> {
  const email = data.email as string;
  const password = data.password as string;
  const result = schemas.loginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      email,
      password,
      errors: result.error.flatten().fieldErrors
    };
  }

  return await loginWithCredentials({ email, password });
}

export async function signup(
  data: z.infer<typeof schemas.signupSchema>
): Promise<FormState | undefined> {
  const result = formSchema.safeParse(data);

  if (!result.success) {
    return { ...data, errors: result.error.flatten().fieldErrors };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email as string }
    });

    if (user) return { ...data, message: '⚠️ Email already exist!' };

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
    return { ...data, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }

  return loginWithCredentials(data);
}

export default async function seed(): Promise<FormState | undefined> {
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

export async function updatePassword(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const result = formSchema.safeParse({ password });

  if (!result.success) {
    return { password, errors: result.error.flatten().fieldErrors };
  }

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

export async function forgetPassword(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const email = formData.get('email') as string;
  const result = formSchema.safeParse({ email });

  if (!result.success) {
    return { email, errors: result.error.flatten().fieldErrors };
  }

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
  { name, email, password, emailVerified }: z.infer<typeof schemas.userSchema>
): Promise<FormState | undefined> {
  const response = { name, email, password, emailVerified };
  const result = schemas.userSchema.safeParse({
    name,
    email,
    password,
    emailVerified
  });

  if (!result.success) {
    return { ...response, errors: result.error.flatten().fieldErrors };
  }

  try {
    const user = await prisma.$transaction(async function (transaction) {
      let existingUser;
      const user = await transaction.user.findUnique({ where: { id } });

      if (email) {
        existingUser = await transaction.user.findUnique({ where: { email } });
      }

      if (email && email !== user?.email && existingUser) return;

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
      return {
        ...response,
        success: false,
        message: '⚠️ Email already registered!',
        emailVerified: result.data.emailVerified
      };
    }

    revalidatePath('/');
    return {
      ...response,
      success: true,
      message: '🎉 Profile updated successfully.'
    };
  } catch {
    return {
      ...response,
      success: false,
      message: CONST.SERVER_ERROR_MESSAGE
    };
  }
}

export async function addDoctor(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const name = formData.get('name') as string;
  const city = formData.get('city') as string;
  const email = formData.get('email') as string;

  const image = formData.get('image') as File;
  const phone = formData.get('phone') as string;
  const gender = formData.get('gender') as string;
  const password = formData.get('password') as string;
  const experience = formData.get('experience') as string;

  const timings = JSON.parse(
    formData.get('timings') as string
  ) as FormState['timings'];

  const specialities = JSON.parse(
    formData.get('specialities') as string
  ) as FormState['specialities'];

  const daysOfVisit = JSON.parse(
    formData.get('daysOfVisit') as string
  ) as FormState['daysOfVisit'];

  const result = formSchema.safeParse({
    name,
    city,
    email,
    phone,
    gender,
    timings,
    password,
    experience,
    daysOfVisit,
    specialities,
    image: image?.name
  });

  const response = {
    name,
    city,
    email,
    phone,
    gender,
    timings,
    password,
    daysOfVisit,
    specialities,
    experience: result.data?.experience as number
  };

  if (!result.success) {
    return { ...response, errors: result.error.flatten().fieldErrors };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) return { ...response, message: '⚠️ Email already exist!' };

    await prisma.$transaction(async function (transaction) {
      const imageUUID = randomUUID();
      const fileExtension = image?.type?.split('/').at(-1);

      if (image?.size) {
        await saveFile(image, `${imageUUID}.${fileExtension}`);
      }

      const role = await transaction.role.findUnique({
        where: { name: 'USER' }
      });

      return await transaction.user.create({
        data: {
          name: result.data.name,
          city: result.data.city,
          email: result.data.email,
          phone: result.data.phone,
          gender: result.data.gender,
          experience: result.data.experience,
          roles: { connect: { id: role?.id } },
          image: image ? `${imageUUID}.${fileExtension}` : undefined,
          daysOfVisit: (result.data.daysOfVisit as P.Day[]) || undefined,
          password: await bcrypt.hash(result.data.password as string, 10),
          specialities: specialities?.length
            ? { connect: specialities?.map(id => ({ id })) }
            : undefined,
          timings: timings?.length
            ? {
                create: timings?.map(t => ({
                  time: t.time,
                  duration: t.duration
                })) as P.TimeSlot[]
              }
            : undefined
        }
      });
    });
  } catch {
    return { ...response, success: false, message: CONST.SERVER_ERROR_MESSAGE };
  }

  return loginWithCredentials(response);
}
