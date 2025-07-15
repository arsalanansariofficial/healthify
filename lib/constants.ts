export const SERVER_ERROR_CODE = 500;

export const LOGIN = '/login';
export const DASHBOARD = '/dashboard';
export const AUTH_ERROR = '/auth-error';
export const SESSION = 'authjs.session-token';
export const SERVER_ERROR_MESSAGE = '⚠️ Something went wrong!';
export const EMAIL_REGISTERED_MESSAGE = '⚠️ Email already registered!';
export const USER_DIR = (process.env.USER_DIR as string) || '/public/users';
export const HOST = (process.env.HOST as string) || 'http://localhost:3000';

export const publicRoutes = [
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

export const urls = [
  { value: '/roles', permission: 'view:roles' },
  { value: '/users', permission: 'view:users' },
  { value: '/doctors', permission: 'view:doctors' },
  { value: '/doctors/add', permission: 'add:doctor' },
  { value: '/dashboard', permission: 'view:dashboard' },
  { value: '/permissions', permission: 'view:permissions' },
  { value: '/roles/assign-roles', permission: 'view:assign-roles' },
  { value: '/doctors/specialities/add', permission: 'add:speciality' },
  { value: '/roles/assign-permissions', permission: 'view:assign-permissions' }
];
