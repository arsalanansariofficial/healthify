import bcrypt from 'bcryptjs';
import GitHub from 'next-auth/providers/github';
import NextAuth, { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Prisma, PrismaClient } from '@prisma/client';
import Credentials from 'next-auth/providers/credentials';

import * as CONST from '@/lib/constants';

type ExtendedUser = Prisma.UserGetPayload<{
  include: { roles: { include: { permissions: true } } };
}>;

declare module 'next-auth' {
  interface User {
    roles: ExtendedUser['roles'];
    expiresAt: number | undefined;
  }
}

const prisma = new PrismaClient();

export const authConfig = {
  providers: [
    GitHub({
      clientId: CONST.GITHUB_CLIENT_ID,
      clientSecret: CONST.GITHUB_CLIENT_SECRET
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: { include: { permissions: true } } }
        });

        if (!user || !user.password) return null;

        let expiresAt;
        const hasPasswordMatch = await bcrypt.compare(password, user.password);

        if (CONST.EXPIRES_AT) {
          expiresAt = Date.now() + CONST.EXPIRES_AT * 1000;
        }

        return user && hasPasswordMatch ? { ...user, expiresAt } : null;
      }
    })
  ]
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  adapter: PrismaAdapter(prisma),
  pages: { signIn: CONST.LOGIN, error: CONST.AUTH_ERROR },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { hasOAuth: true, emailVerified: new Date() }
      });
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') return true;

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      return !existingUser?.emailVerified ? false : true;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.roles = token.roles as ExtendedUser['roles'];
      session.user.expiresAt = token.expiresAt as number | undefined;
      return session;
    },
    async jwt({ token, user, session, trigger }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.expiresAt = user.expiresAt;
      }

      if (trigger === 'update' && session.user) {
        token.id = session.user.id;
        token.roles = session.user.roles;
        token.expiresAt = session.user.expiresAt;
      }

      return token;
    }
  }
});
