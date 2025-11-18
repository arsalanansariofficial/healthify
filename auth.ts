import bcrypt from 'bcrypt-mini';
import GitHub from 'next-auth/providers/github';
import { Permission, Role } from '@prisma/client';
import NextAuth, { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';

import prisma from '@/lib/prisma';

import {
  LOGIN,
  AUTH_ERROR,
  EXPIRES_AT,
  DEFAULT_ROLE,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} from '@/lib/constants';

declare module 'next-auth' {
  interface User {
    roles?: Role[];
    expiresAt?: number;
    city?: string | null;
    phone?: string | null;
    permissions?: Permission[];
  }
}

export const authConfig = {
  trustHost: true,
  providers: [
    GitHub({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;
        if (!bcrypt.compareSync(password, user.password)) return null;

        return user;
      }
    })
  ]
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  adapter: PrismaAdapter(prisma),
  pages: { signIn: LOGIN, error: AUTH_ERROR },
  events: {
    async linkAccount({ user }) {
      const existingUser = await prisma.user.update({
        where: { id: user.id },
        select: { UserRoles: true },
        data: { hasOAuth: true, emailVerified: new Date() }
      });

      if (!existingUser?.UserRoles.length) {
        const defaultRole = await prisma.role.findUnique({
          select: { id: true },
          where: { name: DEFAULT_ROLE }
        });

        await prisma.userRole.create({
          data: {
            userId: user?.id as string,
            roleId: defaultRole?.id as string
          }
        });
      }
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
      session.user.roles = token.roles as Role[];
      session.user.city = token.city as string | undefined;
      session.user.phone = token.phone as string | undefined;
      session.user.permissions = token.permissions as Permission[];
      session.user.expiresAt = token.expiresAt as number | undefined;
      return session;
    },
    async jwt({ token, user, session, trigger }) {
      if (user) {
        if (!user.roles || !user.permissions) {
          const roles = (
            await prisma.userRole.findMany({
              select: { role: true },
              where: { userId: user.id }
            })
          ).map(ur => ur.role);

          const permissions = (
            await prisma.rolePermission.findMany({
              select: { permission: true },
              where: { roleId: { in: roles.map(r => r.id) } }
            })
          ).map(rp => rp.permission);

          user.roles = roles;
          user.permissions = permissions;
        }

        token.id = user.id;
        token.city = user.city;
        token.roles = user.roles;
        token.phone = user.phone;
        token.permissions = user.permissions;
        token.expiresAt = Date.now() + EXPIRES_AT * 1000;
      }

      if (trigger === 'update' && session.user) {
        token.id = session.user.id;
        token.city = session.user.city;
        token.roles = session.user.roles;
        token.phone = session.user.phone;
        token.expiresAt = session.user.expiresAt;
        token.permissions = session.user.permissions;
      }

      return token;
    }
  }
});
