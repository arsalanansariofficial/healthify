import NextAuth from 'next-auth';
import { cookies } from 'next/headers';
import { Permission } from '@prisma/client';

import { auth, authConfig } from '@/auth';
import { hasPermission } from '@/lib/utils';

import {
  URLS,
  LOGIN,
  SESSION,
  DASHBOARD,
  PUBLIC_ROUTES
} from '@/lib/constants';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png)$).*)']
};

export default NextAuth(authConfig).auth(async request => {
  const session = await auth();
  const sessionCookie = await cookies();

  const user = session?.user;
  const isLoggedin = request.auth?.user;
  const path = request.nextUrl.pathname;

  const isAvailableRoute = URLS.some(u => u.value === path);
  const isPublicRoute = PUBLIC_ROUTES.includes(request.nextUrl.pathname);
  const isExpired = user?.expiresAt && user.expiresAt - Date.now() <= 0;

  const foundUrl = URLS.find(u => u.value === path);
  const permissions = user?.permissions as Permission[];
  const permission = foundUrl?.permission || String();

  const hasUrlPermission = user && hasPermission(permissions, permission);

  if (user && isExpired) {
    sessionCookie.delete(SESSION);
    return Response.redirect(new URL(LOGIN, request.nextUrl));
  }

  if (user && !isPublicRoute && isAvailableRoute && !hasUrlPermission) {
    return Response.redirect(new URL(DASHBOARD, request.nextUrl));
  }

  if (!isPublicRoute && !isLoggedin) {
    return Response.redirect(new URL(LOGIN, request.nextUrl));
  }

  if (isPublicRoute && isLoggedin) {
    return Response.redirect(new URL(DASHBOARD, request.nextUrl));
  }
});
