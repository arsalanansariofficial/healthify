import NextAuth from 'next-auth';
import { cookies } from 'next/headers';

import { auth, authConfig } from '@/auth';

const publicRoutes = [
  '/',
  '/seed',
  '/login',
  '/error',
  '/signup',
  '/verify',
  '/forget',
  '/not-found',
  '/auth-error',
  '/create-password'
];

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
};

export default NextAuth(authConfig).auth(async request => {
  const session = await auth();
  const isLoggedin = request.auth?.user;
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  const user = session?.user;
  const isEpired = user?.expiresAt && user.expiresAt - Date.now() <= 0;

  if (user && isEpired) {
    const sessionCookies = await cookies();
    sessionCookies.delete('authjs.session-token');
    return Response.redirect(new URL('/login', request.nextUrl));
  }

  if (!isPublicRoute && !isLoggedin) {
    return Response.redirect(new URL('/login', request.nextUrl));
  }

  if (isPublicRoute && isLoggedin) {
    return Response.redirect(new URL('/dashboard', request.nextUrl));
  }
});
