import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import { PrismaClient } from '@prisma/client';
import Credentials from 'next-auth/providers/credentials';

const prisma = new PrismaClient();
const publicRoutes = ['/', '/login', '/signup'];

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedin = auth?.user;
      const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

      if (isPublicRoute && isLoggedin) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }

      if (!isPublicRoute && !isLoggedin) {
        return Response.redirect(new URL('/login', request.nextUrl));
      }

      return true;
    }
  },
  providers: [
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
});
