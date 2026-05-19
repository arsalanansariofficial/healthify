import { prismaAdapter } from 'better-auth/adapters/prisma';
import { betterAuth } from 'better-auth';
import { HttpStatusCode } from 'axios';
import { Elysia } from 'elysia';

import type { UserWithProfile } from '@/lib/util/types';

import { UnauthorizedError, ApiError } from '@/lib/error';
import { hasValidAuthMethod, mailer } from '@/lib/util';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/config';

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
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
  emailAndPassword: {
    sendResetPassword: async ({ user, url }) => {
      mailer.sendMail({
        html: `Click the link to reset your password: ${url}`,
        subject: 'Reset your password',
        to: user.email
      });
    },
    requireEmailVerification: env.NODE_ENV !== 'test',
    revokeSessionsOnPasswordReset: true,
    enabled: true
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
    if (hasValidAuthMethod(request.method)) return auth.handler(request);
    throw new ApiError(
      [{ message: `Method: ${request.method}, is not allowed.`, path: [path] }],
      'Method not allowed.',
      HttpStatusCode.MethodNotAllowed
    );
  }
);
