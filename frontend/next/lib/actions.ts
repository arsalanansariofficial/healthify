'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { Permission, PrismaClient, Role } from '@prisma/client';

import { signIn } from '@/auth';

const prisma = new PrismaClient();

export type FormState = {
  name?: string;
  role?: string;
  email?: string;
  message?: string;
  success?: boolean;
  password?: string;
  permission?: string;
  emailVerified?: string;
  errors?: {
    name?: string[];
    role?: string[];
    email?: string[];
    password?: string[];
    permission?: string[];
    emailVerified?: string[];
  };
};

const formSchema = z.object({
  emailVerified: z.optional(
    z.enum(['yes', 'no']).transform(val => val === 'yes')
  ),
  email: z.optional(z.string().email({ message: 'Email should be valid.' })),
  password: z.optional(
    z.string().min(1, { message: 'Password should be valid.' })
  ),
  name: z.optional(
    z.string().min(3, { message: 'Should be atleast 3 characters.' })
  ),
  role: z.optional(
    z.string().toUpperCase().min(1, { message: 'Role should be valid.' })
  ),
  permission: z.optional(
    z.string().toUpperCase().min(1, { message: 'Permission should be valid.' })
  )
});

async function generateToken(email: string) {
  const token = await prisma.token.findUnique({ where: { email } });
  if (token) await prisma.token.delete({ where: { email } });
  return await prisma.token.create({
    data: { email, expires: new Date(Date.now() + 60 * 60 * 1000) }
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
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
  } catch {
    return null;
  }
}

async function loginWithCredentials(
  email: string,
  password: string,
  name?: string
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      const token = await generateToken(email);

      const subject = 'Verify Your Email';
      const link = `http://localhost:3000/verify?token=${token.id}`;
      const html = `<p>Click <a href="${link}">here</a> to verify.</p>`;

      const emailSent = await sendEmail(email, subject, html);

      if (token && emailSent) {
        return {
          name,
          email,
          password,
          success: true,
          message: '🎉 Confirmation email sent.'
        };
      }

      return {
        name,
        email,
        password,
        success: false,
        message: '⚠️ Something went wrong!'
      };
    }

    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            name,
            email,
            password,
            success: false,
            message: '⚠️ Invalid email or password!'
          };

        default:
          return {
            name,
            email,
            password,
            success: false,
            message: '⚠️ Something went wrong!'
          };
      }
    }

    throw error;
  }
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath('/');
}

export async function deleteUsers(ids: string[]) {
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  revalidatePath('/');
}

export async function assignRoles(formData: {
  id: string;
  roles: Role[];
}): Promise<FormState | undefined> {
  try {
    await prisma.user.update({
      where: { id: formData.id },
      data: { roles: { set: formData.roles.map(({ id }) => ({ id })) } }
    });
  } catch {
    return { message: 'Something went wrong!' };
  }
}

export async function verifyEmail(
  email: string
): Promise<FormState | undefined> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: '⚠️ User does not exist!' };

    await prisma.user.update({
      where: { email },
      data: { emailVerified: user.emailVerified ? null : new Date() }
    });

    const token = await prisma.token.findUnique({
      where: { email: user.email as string }
    });

    if (token) await prisma.token.delete({ where: { id: token.id } });
    revalidatePath('/');
  } catch {
    return { success: false, message: '⚠️ Something went wrong!' };
  }
}

export async function assignPermissions(formData: {
  role: string;
  permissions: Permission[];
}): Promise<FormState | undefined> {
  try {
    await prisma.role.update({
      where: { name: formData.role },
      data: {
        permissions: { set: formData.permissions.map(({ id }) => ({ id })) }
      }
    });

    return {
      success: true,
      message: '🎉 All permissions are assigned successfully'
    };
  } catch {
    return { success: false, message: '⚠️ Something went wrong!' };
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
    return { role, success: false, message: '⚠️ Something went wrong!' };
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
    return { permission, success: false, message: '⚠️ Something went wrong!' };
  }
}

export async function verifyToken(id: string) {
  const token = await prisma.token.findUnique({ where: { id } });
  if (!token) return { error: "Token doesn't exist!" };

  const hasExpired = new Date(token.expires) < new Date();
  if (hasExpired) return { error: 'Token has expired!' };

  const user = await prisma.user.findUnique({ where: { email: token.email } });
  if (!user) return { error: "Email doesn't exist!" };

  await prisma.user.update({
    where: { id: user.id },
    data: { email: token.email, emailVerified: new Date() }
  });

  await prisma.token.delete({ where: { id: token.id } });
  return { email: token.email, success: 'Email verified.' };
}

export async function login(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const result = formSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      email,
      password,
      errors: result.error.flatten().fieldErrors
    };
  }

  return await loginWithCredentials(email, password);
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
    return { success: false, message: '⚠️ Something went wrong!' };
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

  await prisma.user.update({
    where: { email },
    data: { password: await bcrypt.hash(password, 10) }
  });

  return await loginWithCredentials(email, password);
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

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { email, success: false, message: "⚠️ Email doesn't exist!" };
  }

  const token = await generateToken(user.email as string);

  if (token) {
    const subject = 'Reset Your Password';
    const link = `http://localhost:3000/create-password?token=${token.id}`;
    const html = `<p>Click <a href="${link}">here</a> to reset your password`;
    const emailSent = await sendEmail(email, subject, html);

    if (emailSent) {
      return { email, success: true, message: '🎉 Confirmation email sent.' };
    }

    return { email, success: false, message: '⚠️ Failed to send email!' };
  }

  return { email, success: false, message: '⚠️ Failed to generate token!' };
}

export async function signup(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const result = formSchema.safeParse({ name, email, password });

  if (!result.success) {
    return {
      name,
      email,
      password,
      errors: result.error.flatten().fieldErrors
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    return {
      name,
      email,
      password,
      message: '⚠️ Email already exist!'
    };
  }

  await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10) }
  });

  return loginWithCredentials(email, password, name);
}

export async function updateUser(
  id: string,
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const emailVerified = formData.get('verified') as string;
  const result = formSchema.safeParse({
    name,
    email,
    emailVerified,
    password: password ? password : undefined
  });

  if (!result.success) {
    return {
      name,
      email,
      password,
      emailVerified,
      errors: result.error.flatten().fieldErrors
    };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (email !== user?.email && existingUser) {
    return {
      name,
      email,
      password,
      emailVerified,
      success: false,
      message: '⚠️ Email already registered!'
    };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      emailVerified: result.data.emailVerified ? new Date() : null,
      password: password ? await bcrypt.hash(password, 10) : undefined
    }
  });

  return {
    name,
    email,
    password,
    success: true,
    emailVerified: 'yes',
    message: '🎉 Profile updated successfully.'
  };
}
