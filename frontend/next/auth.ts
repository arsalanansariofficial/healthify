import { PrismaAdapter } from '@auth/prisma-adapter';
import { Permission, Role } from '@prisma/client';
import bcrypt from 'bcrypt-mini';
import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';

import { DATES, O_AUTH, ROLES, ROUTES } from '@/lib/constants';
import prisma from '@/lib/prisma';

declare module 'next-auth' {
  interface User {
    roles?: Role[];
    hasOAuth?: boolean;
    city?: string | null;
    cover?: string | null;
    phone?: string | null;
    permissions?: Permission[];
  }
}

export const authConfig = {
  providers: [
    GitHub({
      clientId: O_AUTH.GITHUB.GITHUB_CLIENT_ID as string,
      clientSecret: O_AUTH.GITHUB.GITHUB_CLIENT_SECRET as string
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
  ],
  trustHost: true
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ account, session, token, trigger, user }) {
      if (user) {
        let { permissions, roles } = user;

        if (!roles || !permissions) {
          roles = (
            await prisma.userRole.findMany({
              select: { role: true },
              where: { userId: user.id }
            })
          ).map(ur => ur.role);

          permissions = (
            await prisma.rolePermission.findMany({
              select: { permission: true },
              where: { roleId: { in: roles.map(r => r.id) } }
            })
          ).map(rp => rp.permission);
        }

        token.id = user.id;
        token.roles = roles;
        token.city = user.city;
        token.phone = user.phone;
        token.image = user.image;
        token.cover = user.cover;
        token.hasOAuth = user.hasOAuth;
        token.permissions = permissions;

        if (account?.provider !== 'credentials') {
          const dbUser = await prisma.user.findUnique({
            select: { hasOAuth: true },
            where: { id: user.id }
          });

          token.hasOAuth = dbUser?.hasOAuth ?? false;
        }
      }

      if (trigger === 'update' && session.user) {
        token.id = session.user.id;
        token.city = session.user.city;
        token.roles = session.user.roles;
        token.phone = session.user.phone;
        token.image = session.user.image;
        token.cover = session.user.cover;
        token.hasOAuth = session.user.hasOAuth;
        token.permissions = session.user.permissions;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.roles = token.roles as Role[];
      session.user.image = token.image as string;
      session.user.cover = token.cover as string;
      session.user.city = token.city as string | undefined;
      session.user.phone = token.phone as string | undefined;
      session.user.permissions = token.permissions as Permission[];
      session.user.hasOAuth = token.hasOAuth as boolean | undefined;
      return session;
    },
    async signIn({ account, user }) {
      if (account?.provider !== 'credentials') return true;

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      return Boolean(existingUser?.emailVerified);
    }
  },
  events: {
    async linkAccount({ user }) {
      const existingUser = await prisma.user.update({
        data: { emailVerified: new Date(), hasOAuth: true },
        select: { UserRoles: true },
        where: { id: user.id }
      });

      if (!existingUser?.UserRoles.length) {
        const defaultRole = await prisma.role.findUnique({
          select: { id: true },
          where: { name: ROLES.USER as string }
        });

        await prisma.userRole.create({
          data: {
            roleId: defaultRole?.id as string,
            userId: user?.id as string
          }
        });
      }
    }
  },
  pages: { error: ROUTES.AUTH_ERROR, signIn: ROUTES.LOGIN },
  session: { maxAge: DATES.EXPIRES_AT as number, strategy: 'jwt' }
});
