import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const publicRoutes = ['/', '/login', '/signup'];
const admin = { email: 'admin@admin.com', password: 'admin' };

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as typeof admin;

        if (email === admin.email && password === admin.password) {
          return credentials;
        }

        return null;
      }
    })
  ],
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
  }
});
