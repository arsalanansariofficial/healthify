'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { Day, Permission, PrismaClient, Role, TimeSlot } from '@prisma/client';

import { signIn } from '@/auth';

const prisma = new PrismaClient();

export type FormState = {
  name?: string;
  role?: string;
  city?: string;
  email?: string;
  phone?: string;
  gender?: string;
  message?: string;
  success?: boolean;
  password?: string;
  permission?: string;
  experience?: number;
  emailVerified?: string;
  daysOfVisit?: string[];
  specialities?: { id: string; name: string }[];
  timings?: { time: `${number}:${number}:${number}`; duration: number }[];
  errors?: {
    city?: string[];
    name?: string[];
    role?: string[];
    phone?: string[];
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
  email: z.optional(z.string().email({ message: 'Email should be valid.' })),
  emailVerified: z.optional(
    z.enum(['yes', 'no']).transform(val => val === 'yes')
  ),
  password: z.optional(
    z.string().min(1, { message: 'Password should be valid.' })
  ),
  experience: z.optional(
    z.number().min(1, { message: 'Experience should be valid.' })
  ),
  name: z.optional(
    z.string().min(3, { message: 'Should be atleast 3 characters.' })
  ),
  role: z.optional(
    z.string().toUpperCase().min(1, { message: 'Role should be valid.' })
  ),
  gender: z.optional(
    z.enum(['MALE', 'FEMALE'], { message: 'Gender should be valid.' })
  ),
  city: z.optional(
    z.string().toUpperCase().min(1, { message: 'City should be valid.' })
  ),
  permission: z.optional(
    z.string().toUpperCase().min(1, { message: 'Permission should be valid.' })
  ),
  daysOfVisit: z.optional(
    z.array(
      z.string().toUpperCase().min(1, { message: 'Day should be valid.' })
    )
  ),
  phone: z.optional(
    z
      .string()
      .regex(/^\+?\d{10,15}$/, { message: 'Invalid phone number format.' })
  ),
  specialities: z.optional(
    z.array(
      z.object({
        id: z.string().min(1, { message: 'Id should be valid.' }),
        name: z
          .string()
          .toUpperCase()
          .min(1, { message: 'Name should be valid.' })
      })
    )
  ),
  timings: z.optional(
    z.array(
      z.object({
        duration: z.number().positive({
          message: 'Duration must be a positive number'
        }),
        time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
          message: 'Invalid time format. Expected HH:MM:SS (24-hour format)'
        })
      })
    )
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
      data: { name: result.data.name as string }
    });

    revalidatePath('/');
    return {
      name,
      success: true,
      message: '🎉 Speciality added successfully!'
    };
  } catch {
    return { name, success: false, message: '⚠️ Something went wrong!' };
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

export async function signup(
  _: unknown,
  formData: FormData
): Promise<FormState | undefined> {
  const name = formData.get('name') as string;
  const city = formData.get('city') as string;
  const email = formData.get('email') as string;

  const phone = formData.get('phone') as string;
  const gender = formData.get('gender') as string;
  const password = formData.get('password') as string;

  const experience = Number(formData.get('experience') as string);

  const timings = JSON.parse(
    formData.get('timings') as string
  ) as FormState['timings'];

  const specialities = JSON.parse(
    formData.get('specialities') as string
  ) as FormState['specialities'];

  const daysOfVisit = JSON.parse(
    formData.get('days-of-visit') as string
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
    specialities,
    daysOfVisit
  });

  if (!result.success) {
    return {
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
      errors: result.error.flatten().fieldErrors
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    return {
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
      message: '⚠️ Email already exist!'
    };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      city,
      phone,
      gender,
      experience,
      daysOfVisit: daysOfVisit as Day[],
      password: await bcrypt.hash(password, 10),
      timings: { create: timings as TimeSlot[] },
      specialityIDs: specialities?.map(s => s.id)
    }
  });

  return loginWithCredentials(email, password, name);
}
