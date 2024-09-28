import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import GitHub from 'next-auth/providers/github';
import NextAuth, { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface User {
    role?: 'ADMIN' | 'USER';
  }
}

const prisma = new PrismaClient();

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const hasPasswordMatch = await bcrypt.compare(password, user.password);
        return user && hasPasswordMatch ? user : null;
      }
    })
  ]
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  adapter: PrismaAdapter(prisma),
  pages: { signIn: '/login', error: '/auth-error' },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
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
      session.user.role = token.role as 'ADMIN' | 'USER';
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    }
  }
});
