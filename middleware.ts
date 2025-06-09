import NextAuth from 'next-auth';
import { authConfig } from '@/auth';

const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/verify',
  '/forget',
  '/create-password'
];

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
};

export default NextAuth(authConfig).auth(async request => {
  const isLoggedin = request.auth?.user;
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  if (!isPublicRoute && !isLoggedin) {
    return Response.redirect(new URL('/login', request.nextUrl));
  }

  if (isPublicRoute && isLoggedin) {
    return Response.redirect(new URL('/dashboard', request.nextUrl));
  }
});
