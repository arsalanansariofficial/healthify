import { APIError as BetterAuthError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { HttpStatusCode } from 'axios';
import { Elysia } from 'elysia';

import type { UserWithProfile } from '@/lib/util/types';

import { hasValidAuthMethod, isFileError, mailer } from '@/lib/util';
import { UnauthorizedError, ApiError } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import { remove } from '@/lib/file';
import { env } from '@/lib/config';

export const auth = betterAuth({
  user: {
    deleteUser: {
      async beforeDelete(user) {
        try {
          const profile = await prisma.userProfile.findUnique({
            where: { userId: user.id }
          });

          if (!profile) return;
          if (profile.image) await remove(profile.image);
          if (profile.cover) await remove(profile.cover);
        } catch (error) {
          if (error instanceof Error && isFileError(error))
            throw new BetterAuthError(HttpStatusCode.BadRequest, {
              ...new ApiError(
                [{ path: [error.path as string], message: error.message }],
                error.code,
                HttpStatusCode.BadRequest
              )
            });
        }
      },
      async sendDeleteAccountVerification({ user, url }) {
        mailer.sendMail({
          html: `Click the link to delete your account: ${url}`,
          subject: 'Verification to delete your account',
          to: user.email
        });
      },
      enabled: true
    },
    changeEmail: { updateEmailWithoutVerification: true, enabled: true }
  },
  emailAndPassword: {
    async sendResetPassword({ user, url }) {
      mailer.sendMail({
        html: `Click the link to reset your password: ${url}`,
        subject: 'Reset your password',
        to: user.email
      });
    },
    maxPasswordLength: env.BETTER_AUTH_MAX_PASSWORD_LENGTH,
    minPasswordLength: env.BETTER_AUTH_MIN_PASSWORD_LENGTH,
    requireEmailVerification: env.NODE_ENV !== 'test',
    revokeSessionsOnPasswordReset: true,
    enabled: true
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      mailer.sendMail({
        html: `Click the link to verify your email: ${url}`,
        subject: 'Verify your email address',
        to: user.email
      });
    },
    sendOnSignUp: env.NODE_ENV !== 'test',
    sendOnSignIn: env.NODE_ENV !== 'test',
    autoSignInAfterVerification: true
  },
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID &&
      env.GITHUB_CLIENT_SECRET && {
        github: {
          clientSecret: env.GITHUB_CLIENT_SECRET,
          clientId: env.GITHUB_CLIENT_ID
        }
      })
  },
  advanced: {
    cookies: { session: { name: 'session-token' } },
    database: { generateId: 'uuid', joins: true },
    cookiePrefix: 'task-manager',
    disableOriginCheck: true,
    disableCSRFCheck: false
  },
  session: {
    cookieCache: {
      maxAge: env.BETTER_AUTH_COOKIE_CACHE_TIMEOUT,
      enabled: true
    },
    expiresIn: env.BETTER_AUTH_SESSION_EXPIRES_IN,
    disableSessionRefresh: true
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      updateUserInfoOnLink: true,
      allowUnlinkingAll: true
    }
  },
  database: prismaAdapter(prisma, { provider: 'mysql' })
});

export const loadAuthContext = new Elysia({ name: 'AuthContext.Plugin' })
  .resolve(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new UnauthorizedError();
    return {
      ...session,
      user: {
        ...session.user,
        profile: await prisma.userProfile.findUnique({
          where: { userId: session.user.id }
        })
      } as UserWithProfile
    };
  })
  .as('scoped');

export const authRoutes = new Elysia({ name: 'BetterAuth.Routes' }).all(
  '/api/auth/*',
  ({ request, path }) => {
    const method = request.method.toLowerCase();
    if (hasValidAuthMethod(method)) return auth.handler(request);
    throw new ApiError(
      [{ message: `Method: ${method}, is not allowed.`, path: [path] }],
      'Method not allowed.',
      HttpStatusCode.MethodNotAllowed
    );
  }
);
