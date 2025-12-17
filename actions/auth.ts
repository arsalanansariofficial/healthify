'use server';

import z from 'zod';
import bcrypt from 'bcrypt-mini';

import { signIn } from '@/auth';
import prisma from '@/lib/prisma';
import { ROLES } from '@/constants/roles';
import { sendEmail } from '@/actions/email';
import { MESSAGES } from '@/constants/messages';
import { DATES, DOMAIN, ROUTES } from '@/lib/constants';
import { catchAuthError, catchErrors } from '@/lib/utils';
import { loginSchema, signupSchema } from '@/lib/schemas';
import { VerifyEmail } from '@/components/email/account/email';

export async function generateToken(userId: string) {
  return await prisma.$transaction(async function (transaction) {
    const token = await transaction.token.findUnique({ where: { userId } });
    if (token) await transaction.token.delete({ where: { userId } });
    return await transaction.token.create({
      data: {
        userId,
        expires: new Date(Date.now() + (DATES.EXPIRES_AT as number) * 1000)
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
      return { success: false, message: MESSAGES.USER.EMAIL_NOT_FOUND };
    }

    if (!user.emailVerified) {
      const token = await generateToken(user.id as string);

      if (!token) {
        return { success: false, message: MESSAGES.AUTH.TOKEN_NOT_GENERATED };
      }

      const html = VerifyEmail({ data: { token: token.id } });
      const subject = `${DOMAIN.LOCAL}/verify?token=${token.id}`;
      const emailSent = await sendEmail(email, subject, html);

      if (!emailSent) {
        return { success: false, message: MESSAGES.USER.EMAIL_BOUNCED };
      }

      return { success: true, message: MESSAGES.USER.CONFIRM_EMAIL };
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
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  return await loginWithCredentials({ email, password }, redirectTo);
}

export async function signup(
  data: z.infer<typeof signupSchema>,
  redirectTo?: string
) {
  const result = signupSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email as string }
    });

    if (user)
      return { success: false, message: MESSAGES.USER.EMAIL_REGISTERED };

    await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({
        where: { name: ROLES.USER as string }
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
