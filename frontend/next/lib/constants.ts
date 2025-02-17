export const HOME = '/';
export const LOGIN = '/login';

export const SIGNUP = '/signup';
export const DASHBOARD = '/dashboard';

export const FORGET = '/forget';
export const AUTH_ERROR = '/auth-error';
export const SESSION = 'authjs.session-token';

export const ADMIN_ROLE = process.env?.ADMIN_ROLE || 'ADMIN';
export const DEFAULT_ROLE = process.env?.DEFAULT_ROLE || 'USER';

export const ADMIN_NAME = process.env?.ADMIN_NAME || 'Admin User';
export const IS_PRODUCTION = process.env?.NODE_ENV === 'production';
export const SMTP_PASSWORD = process.env?.SMTP_PASSWORD || 'password';

export const SMTP_EMAIL = process.env?.SMTP_EMAIL || 'email@domain.com';
export const ADMIN_PASSWORD = process.env?.ADMIN_PASSWORD || 'admin.user';

export const HOST = (process.env?.HOST as string) || 'http://localhost:3000';
export const USER_DIR = (process.env?.USER_DIR as string) || '/public/users';
export const SMTP_HOST_NAME = process.env?.SMTP_HOST_NAME || 'smtp.gmail.com';

export const PAGE_NOT_FOUND = process.env?.PAGE_NOT_FOUND || 'Page not found!';

export const GITHUB_CLIENT_ID =
  process.env?.GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID';

export const GITHUB_CLIENT_SECRET =
  process.env?.GITHUB_CLIENT_SECRET || 'GITHUB_CLIENT_SECRET';

export const ROLE_ADDED =
  process.env?.ROLE_ADDED || '🎉 Role added successfully!';

export const INVALID_INPUTS =
  process.env?.INVALID_INPUTS || '⚠️ Invalid inputs!';

export const TOKEN_EXPIRED =
  process.env?.TOKEN_EXPIRED || '⚠️ Token has expired!';

export const ADMIN_EMAIL =
  process.env?.ADMIN_EMAIL || 'admin.user@ansari.dashboard';

export const USER_NOT_FOUND =
  process.env?.USER_NOT_FOUND || '⚠️ User does not exist!';

export const DEFAULT_PERMISSION =
  process.env?.DEFAULT_PERMISSION || 'VIEW:DASHBOARD';

export const EMAIL_NOT_FOUND =
  process.env?.EMAIL_NOT_FOUND || "⚠️ Email doesn't exist!";

export const CONFIRM_EMAIL =
  process.env?.CONFIRM_EMAIL || '🎉 Confirmation email sent.';

export const TOKEN_NOT_FOUND =
  process.env?.TOKEN_NOT_FOUND || "⚠️ Token doesn't exist!";

export const EMAIL_VERIFIED =
  process.env?.EMAIL_VERIFIED || '🎉 Email verified successfully.';

export const EMAIL_REGISTERED =
  process.env?.EMAIL_REGISTERED || '⚠️ Email already registered!';

export const PROFILE_UPDATED =
  process.env?.PROFILE_UPDATED || '🎉 Profile updated successfully.';

export const ROLES_ASSIGNED =
  process.env?.ROLES_ASSIGNED || '🎉 Roles are assigned successfully.';

export const SPECIALITY_ADDED =
  process.env?.SPECIALITY_ADDED || '🎉 Speciality added successfully!';

export const DATABASE_UPDATED =
  process.env?.DATABASE_UPDATED || '🎉 Database updated successfully.';

export const PERMISSION_ADDED =
  process.env?.PERMISSION_ADDED || '🎉 Permission added successfully.';

export const SERVER_ERROR_MESSAGE =
  process.env?.SERVER_ERROR_MESSAGE || '⚠️ Something went wrong!';

export const SPECIALITY_DELETED =
  process.env?.SPECIALITY_DELETED || '🎉 Speciality deleted successfully.';

export const SPECIALITIES_DELETED =
  process.env?.SPECIALITIES_DELETED || '🎉 Specialities deleted successfully.';

export const USER_DELETED =
  process.env?.USER_DELETED || '🎉 User deleted successfully.';

export const USERS_DELETED =
  process.env?.USERS_DELETED || '🎉 Users deleted successfully.';

export const SPECIALITY_UPDATED =
  process.env?.SPECIALITY_UPDATED || '🎉 Speciality updated successfully.';

export const PERMISSIONS_ASSIGNED =
  process.env?.PERMISSIONS_ASSIGNED ||
  '🎉 All permissions are assigned successfully.';

export const EXPIRES_AT =
  process.env?.EXPIRES_AT && !isNaN(Number(process.env?.EXPIRES_AT))
    ? +process.env?.EXPIRES_AT
    : 3600;

export const SMTP_PORT_NUMBER =
  process.env?.SMTP_PORT_NUMBER && !isNaN(Number(process.env?.SMTP_PORT_NUMBER))
    ? +process.env?.SMTP_PORT_NUMBER
    : 465;

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

export const CHARTS_DATA = [
  { month: 'Jan', users: 186 },
  { month: 'Feb', users: 305 },
  { month: 'Mar', users: 237 },
  { month: 'Apr', users: 173 },
  { month: 'May', users: 209 },
  { month: 'Jun', users: 214 }
];

export const DAYS = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }
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

export const SIDEBAR_ITEMS = [
  { url: '/dashboard', label: 'Dashboard', permission: 'view:dashboard' },
  { url: '/users', label: 'Users', permission: 'view:users' },
  { url: '/doctors', label: 'Doctors', permission: 'view:doctors' },
  { url: '/roles', label: 'Roles', permission: 'view:roles' },
  {
    url: '/roles/assign-roles',
    label: 'Assign Roles',
    permission: 'view:assign-roles'
  },
  { url: '/permissions', label: 'Permissions', permission: 'view:permissions' },
  {
    url: '/roles/assign-permissions',
    label: 'Assign Permissions',
    permission: 'view:assign-permissions'
  }
];

export const CARDS_DATA = [
  {
    action: '+12.5%',
    title: '$1,250.00',
    description: 'Total Revenue',
    subtitle: 'Trending up this month',
    summary: 'Visitors for the last 6 months'
  },
  {
    action: '-20%',
    title: '1,234',
    description: 'New Customers',
    subtitle: 'Down 20% this period',
    summary: 'Acquisition needs attention'
  },
  {
    action: '+12.5%',
    title: '45,678',
    description: 'Active Accounts',
    subtitle: 'Strong user retention',
    summary: 'Engagement exceed targets'
  },
  {
    title: '4.5%',
    action: '+4.5%',
    description: 'Growth Rate',
    subtitle: 'Steady performance increase',
    summary: 'Meets growth projections as expected'
  }
];
