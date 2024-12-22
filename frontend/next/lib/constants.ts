export const LOGIN = '/login';
export const DASHBOARD = '/dashboard';
export const SESSION = 'authjs.session-token';

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
  { value: '/roles/roles', permission: 'view:roles' },
  { value: '/doctors/add', permission: 'add:doctor' },
  { value: '/dashboard', permission: 'view:dashboard' },
  { value: '/permissions', permission: 'view:permissions' },
  { value: '/roles/assign-roles', permission: 'view:assign-roles' },
  { value: '/doctors/specialities/add', permission: 'add:speciality' },
  { value: '/roles/assign-permissions', permission: 'view:assign-permissions' }
];
