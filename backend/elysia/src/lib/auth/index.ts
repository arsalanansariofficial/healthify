import { prismaAdapter } from 'better-auth/adapters/prisma';
import { betterAuth } from 'better-auth';
import { HttpStatusCode } from 'axios';
import { Elysia } from 'elysia';

import type { UserWithProfile } from '@/lib/util/types';

import { UnauthorizedError, ApiError } from '@/lib/error';
import { hasValidAuthMethod } from '@/lib/util';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/config';

export const auth = betterAuth({
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID &&
      env.GITHUB_CLIENT_SECRET && {
        github: {
          clientSecret: env.GITHUB_CLIENT_SECRET,
          clientId: env.GITHUB_CLIENT_ID
        }
      })
  },
  advanced: { disableOriginCheck: true, disableCSRFCheck: false },
  database: prismaAdapter(prisma, { provider: 'mysql' }),
  emailAndPassword: { enabled: true }
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
