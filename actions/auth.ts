'use server';

import bcrypt from 'bcrypt-mini';
import z from 'zod';

import { sendEmail } from '@/actions/email';
import { signIn } from '@/auth';
import { VerifyEmail } from '@/components/email/account/email';
import { MESSAGES } from '@/constants/messages';
import { ROLES } from '@/constants/roles';
import { DATES, DOMAIN, ROUTES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { loginSchema, signupSchema } from '@/lib/schemas';
import { catchAuthError, catchErrors } from '@/lib/utils';

export async function generateToken(userId: string) {
  return await prisma.$transaction(async function (transaction) {
    const token = await transaction.token.findUnique({ where: { userId } });
    if (token) await transaction.token.delete({ where: { userId } });
    return await transaction.token.create({
      data: {
        expires: new Date(Date.now() + (DATES.EXPIRES_AT as number) * 1000),
        userId
      }
    });
  });
}

export async function loginWithCredentials(
  { email, password }: z.infer<typeof loginSchema>,
  redirectTo?: string
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: MESSAGES.USER.EMAIL_NOT_FOUND, success: false };
    }

    if (!user.emailVerified) {
      const token = await generateToken(user.id as string);

      if (!token) {
        return { message: MESSAGES.AUTH.TOKEN_NOT_GENERATED, success: false };
      }

      const html = VerifyEmail({ data: { token: token.id } });
      const subject = `${DOMAIN.LOCAL}/verify?token=${token.id}`;
      const emailSent = await sendEmail(email, subject, html);

      if (!emailSent) {
        return { message: MESSAGES.USER.EMAIL_BOUNCED, success: false };
      }

      return { message: MESSAGES.USER.CONFIRM_EMAIL, success: true };
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: redirectTo || ROUTES.DASHBOARD
    });
  } catch (error) {
    return catchAuthError(error as Error);
  }
}

export async function login(
  data: z.infer<typeof loginSchema>,
  redirectTo?: string
) {
  const email = data.email as string;
  const password = data.password as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  return await loginWithCredentials({ email, password }, redirectTo);
}

export async function signup(
  data: z.infer<typeof signupSchema>,
  redirectTo?: string
) {
  const result = signupSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email as string }
    });

    if (user)
      return { message: MESSAGES.USER.EMAIL_REGISTERED, success: false };

    await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({
        where: { name: ROLES.USER as string }
      });

      const user = await transaction.user.create({
        data: {
          email: result.data.email,
          name: result.data.name,
          password: bcrypt.hashSync(result.data.password as string, 10)
        }
      });

      await transaction.userRole.create({
        data: { roleId: role?.id as string, userId: user.id }
      });
    });
  } catch (error) {
    return catchErrors(error as Error);
  }

  return loginWithCredentials(data, redirectTo);
}
