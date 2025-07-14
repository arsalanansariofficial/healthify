import NextAuth from 'next-auth';
import { cookies } from 'next/headers';

import { auth, authConfig } from '@/auth';
import { hasPermission } from '@/lib/utils';

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

const urls = [
  { value: '/roles', permission: 'view:roles' },
  { value: '/users', permission: 'view:users' },
  { value: '/doctors', permission: 'view:doctors' },
  { value: '/roles/roles', permission: 'view:roles' },
  { value: '/doctors/add', permission: 'add:doctor' },
  { value: '/dashboard', permission: 'view:dashboard' },
  { value: '/permissions', permission: 'view:permissions' },
  { value: '/roles/assign-roles', permission: 'view:assign-roles' },
  { value: '/doctors/specialities/add', permission: 'add:speciality' },
  { value: '/roles/assign-permissions', permission: 'view:assign-permissions' }
];

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
};

export default NextAuth(authConfig).auth(async request => {
  const session = await auth();
  const isLoggedin = request.auth?.user;
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  const access = urls.find(u => u.value === path)?.permission || String();

  const user = session?.user;
  const isExpired = user?.expiresAt && user.expiresAt - Date.now() <= 0;

  if (user && isExpired) {
    const sessionCookies = await cookies();
    sessionCookies.delete('authjs.session-token');
    return Response.redirect(new URL('/login', request.nextUrl));
  }

  if (
    user &&
    !isPublicRoute &&
    urls.some(u => u.value === path) &&
    !hasPermission(user?.roles, access)
  ) {
    return Response.redirect(new URL('/dashboard', request.nextUrl));
  }

  if (!isPublicRoute && !isLoggedin) {
    return Response.redirect(new URL('/login', request.nextUrl));
  }

  if (isPublicRoute && isLoggedin) {
    return Response.redirect(new URL('/dashboard', request.nextUrl));
  }
});
