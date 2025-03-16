let EXPIRES_AT = 3600;
let SMTP_PORT_NUMBER = 465;
let GITHUB_CLIENT_ID = 'GITHUB_CLIENT_ID';
let INVALID_INPUTS = '⚠️ Invalid inputs!';

let DEFAULT_PERMISSION = 'VIEW:DASHBOARD';
let TOKEN_EXPIRED = '⚠️ Token has expired!';
let ROLE_ADDED = '🎉 Role added successfully!';

let USER_NOT_FOUND = '⚠️ User does not exist!';
let ADMIN_EMAIL = 'admin.user@ansari.dashboard';
let EMAIL_NOT_FOUND = "⚠️ Email doesn't exist!";

let TOKEN_NOT_FOUND = "⚠️ Token doesn't exist!";
let CONFIRM_EMAIL = '🎉 Confirmation email sent.';
let GITHUB_CLIENT_SECRET = 'GITHUB_CLIENT_SECRET';

let USER_DELETED = '🎉 User deleted successfully.';
let USERS_DELETED = '🎉 Users deleted successfully.';
let EMAIL_VERIFIED = '🎉 Email verified successfully.';

let EMAIL_REGISTERED = '⚠️ Email already registered!';
let SERVER_ERROR_MESSAGE = '⚠️ Something went wrong!';
let PROFILE_UPDATED = '🎉 Profile updated successfully.';
let ROLES_ASSIGNED = '🎉 Roles are assigned successfully.';

let SPECIALITY_ADDED = '🎉 Speciality added successfully!';
let DATABASE_UPDATED = '🎉 Database updated successfully.';
let PERMISSION_ADDED = '🎉 Permission added successfully.';

let SPECIALITY_DELETED = '🎉 Speciality deleted successfully.';
let SPECIALITY_UPDATED = '🎉 Speciality updated successfully.';
let SPECIALITIES_DELETED = '🎉 Specialities deleted successfully.';
let PERMISSIONS_ASSIGNED = '🎉 All permissions are assigned successfully.';

export const EMAIL_FAILED = '⚠️ Failed to send email!';
export const SPACE_FULL = '⚠️ No space left on device!';
export const SMTP_TIME_OUT = '⚠️ SMTP connection timed out!';
export const INVALID_CREDENTIALS = '⚠️ Invalid email or password!';
export const PRISMA_INIT = '⚠️ Failed to initialize prisma client!';
export const DIRECTORY_NOT_FOUND = '⚠️ Upload directory not found!';
export const DB_INIT = '⚠️ Failed to initialize database connection!';
export const E_CONNECT_FAILED = '⚠️ Could not connect to SMTP server!';
export const E_AUTH_FAILED = '⚠️ Authentication failed with SMTP server!';
export const PERMISSION_DENIED = '⚠️ Permission denied while saving file!';
export const TOKEN_NOT_GENERATED = '⚠️ Failed to generate verification token!';

const HOME = '/';
const LOGIN = '/login';
const SIGNUP = '/signup';

const FORGET = '/forget';
const DASHBOARD = '/dashboard';
const AUTH_ERROR = '/auth-error';

const MIN_DATE = new Date(Date.now());
const SESSION = 'authjs.session-token';
const USER_NAME = 'arsalanansariofficial';

const EMAIL = 'theansaricompany@gmail.com';
const WHATS_APP = 'https://wa.link/dnq2t8';
const RESOURCE = 'resources/refs/heads/main';

const CDN = 'https://raw.githubusercontent.com';
const ADMIN_ROLE = process.env?.ADMIN_ROLE || 'ADMIN';

const SMTP_PORT = Number(process.env?.SMTP_PORT_NUMBER);
const DEFAULT_ROLE = process.env?.DEFAULT_ROLE || 'USER';
const DOCTOR_ROLE = process.env?.DOCTOR_ROLE || 'DOCTOR';

const ADMIN_NAME = process.env?.ADMIN_NAME || 'Admin User';
const IS_PRODUCTION = process.env?.NODE_ENV === 'production';
const LINKED_IN = `https://www.linkedin.com/in/${USER_NAME}/`;

const SMTP_PASSWORD = process.env?.SMTP_PASSWORD || 'password';
const GIT_HUB = `https://github.com/${USER_NAME}/${USER_NAME}`;
const MAX_DATE = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

const SMTP_EMAIL = process.env?.SMTP_EMAIL || 'email@domain.com';
const ADMIN_PASSWORD = process.env?.ADMIN_PASSWORD || 'admin.user';
const HOST = (process.env?.HOST as string) || 'http://localhost:3000';

const RESUME_PATH = `${RESOURCE}/documents/arsalan-ansari_resume.pdf`;
const MAIL_TO = `mailto:${EMAIL}?subject=Mail%20To%20Arsalan%20Ansari`;
const PAGE_NOT_FOUND = process.env?.PAGE_NOT_FOUND || 'Page not found!';

const RESUME = `${CDN}/${USER_NAME}/${RESUME_PATH}`;
const USER_DIR = (process.env?.USER_DIR as string) || '/public/users';
const SMTP_HOST_NAME = process.env?.SMTP_HOST_NAME || 'smtp.gmail.com';

const CHARTS_DATA = [
  { month: 'Jan', users: 186 },
  { month: 'Feb', users: 305 },
  { month: 'Mar', users: 237 },
  { month: 'Apr', users: 173 },
  { month: 'May', users: 209 },
  { month: 'Jun', users: 214 }
];

const DAYS = [
  { value: 'SUNDAY', label: 'SUNDAY' },
  { value: 'MONDAY', label: 'MONDAY' },
  { value: 'FRIDAY', label: 'FRIDAY' },
  { value: 'TUESDAY', label: 'TUESDAY' },
  { value: 'THURSDAY', label: 'THURSDAY' },
  { value: 'SATURDAY', label: 'SATURDAY' },
  { value: 'WEDNESDAY', label: 'WEDNESDAY' }
];

const CARDS_DATA = [
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

const PUBLIC_ROUTES = [
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

const URLS = [
  { value: '/roles', permission: 'view:roles' },
  { value: '/users', permission: 'view:users' },
  { value: '/doctors', permission: 'view:doctors' },
  { value: '/receipt', permission: 'view:receipt' },
  { value: '/doctors/add', permission: 'add:doctor' },
  { value: '/dashboard', permission: 'view:dashboard' },
  { value: '/permissions', permission: 'view:permissions' },
  { value: '/appointments', permission: 'view:appointments' },
  { value: '/roles/assign-roles', permission: 'view:assign-roles' },
  { value: '/doctors/specialities/add', permission: 'add:speciality' },
  { value: '/roles/assign-permissions', permission: 'view:assign-permissions' }
];

const SIDEBAR_ITEMS = new Map([
  [
    {
      label: 'Home',
      permission: 'view:dashboard'
    },
    [
      {
        url: '/dashboard',
        label: 'Dashboard',
        permission: 'view:dashboard'
      }
    ]
  ],
  [
    {
      label: 'Doctors',
      permission: 'view:doctors'
    },
    [
      {
        label: 'View',
        url: '/doctors',
        permission: 'view:doctors'
      },
      {
        label: 'Add',
        url: '/doctors/add',
        permission: 'add:doctor'
      }
    ]
  ],
  [
    {
      label: 'Specialities',
      permission: 'view:specialities'
    },
    [
      {
        label: 'View',
        url: '/specialities',
        permission: 'view:specialities'
      },
      {
        label: 'Add',
        url: '/specialities/add',
        permission: 'add:speciality'
      }
    ]
  ],
  [
    {
      label: 'Appointments',
      permission: 'view:appointments'
    },
    [
      {
        label: 'View',
        url: '/appointments',
        permission: 'view:appointments'
      },
      {
        label: 'Receipt',
        permission: 'view:receipt',
        url: '/appointments/receipt'
      }
    ]
  ],
  [
    {
      label: 'User Management',
      permission: 'view:dashboard'
    },
    [
      {
        url: '/users',
        label: 'View',
        permission: 'view:users'
      }
    ]
  ],
  [
    {
      label: 'Roles Management',
      permission: 'view:dashboard'
    },
    [
      {
        label: 'Add',
        url: '/roles/add',
        permission: 'add:role'
      },
      {
        label: 'Assign',
        url: '/roles/assign',
        permission: 'assign:roles'
      }
    ]
  ],
  [
    {
      permission: 'view:dashboard',
      label: 'Permissions Management'
    },
    [
      {
        label: 'Add',
        url: '/permissions/add',
        permission: 'add:permission'
      },
      {
        label: 'Assign',
        url: '/permissions/assign',
        permission: 'assign:permissions'
      }
    ]
  ],
  [
    {
      label: 'Your Account',
      permission: 'view:dashboard'
    },
    [
      {
        url: '/account',
        label: 'Profile',
        permission: 'view:account'
      }
    ]
  ]
]);

if (!isNaN(SMTP_PORT)) SMTP_PORT_NUMBER = SMTP_PORT;
if (process.env?.ROLE_ADDED) ROLE_ADDED = process.env.ROLE_ADDED;
if (process.env?.ADMIN_EMAIL) ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (process.env?.USER_DELETED) USER_DELETED = process.env.USER_DELETED;
if (process.env?.TOKEN_EXPIRED) TOKEN_EXPIRED = process.env.TOKEN_EXPIRED;
if (process.env?.USERS_DELETED) USERS_DELETED = process.env.USERS_DELETED;

if (process.env?.INVALID_INPUTS) INVALID_INPUTS = process.env.INVALID_INPUTS;
if (process.env?.USER_NOT_FOUND) USER_NOT_FOUND = process.env.USER_NOT_FOUND;
if (process.env?.EMAIL_VERIFIED) EMAIL_VERIFIED = process.env.EMAIL_VERIFIED;

if (process.env?.ROLES_ASSIGNED) ROLES_ASSIGNED = process.env.ROLES_ASSIGNED;
if (process.env?.EMAIL_NOT_FOUND) EMAIL_NOT_FOUND = process.env.EMAIL_NOT_FOUND;
if (process.env?.PROFILE_UPDATED) PROFILE_UPDATED = process.env.PROFILE_UPDATED;

if (process.env?.CONFIRM_EMAIL) {
  CONFIRM_EMAIL = process.env.CONFIRM_EMAIL;
}

if (process.env?.TOKEN_NOT_FOUND) {
  TOKEN_NOT_FOUND = process.env.TOKEN_NOT_FOUND;
}

if (process.env?.GITHUB_CLIENT_ID) {
  GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
}

if (process.env?.EMAIL_REGISTERED) {
  EMAIL_REGISTERED = process.env.EMAIL_REGISTERED;
}

if (process.env?.SPECIALITY_ADDED) {
  SPECIALITY_ADDED = process.env.SPECIALITY_ADDED;
}

if (process.env?.DATABASE_UPDATED) {
  DATABASE_UPDATED = process.env.DATABASE_UPDATED;
}

if (process.env?.PERMISSION_ADDED) {
  PERMISSION_ADDED = process.env.PERMISSION_ADDED;
}

if (process.env?.DEFAULT_PERMISSION) {
  DEFAULT_PERMISSION = process.env.DEFAULT_PERMISSION;
}

if (process.env?.SPECIALITY_DELETED) {
  SPECIALITY_DELETED = process.env.SPECIALITY_DELETED;
}

if (process.env?.SPECIALITY_UPDATED) {
  SPECIALITY_UPDATED = process.env.SPECIALITY_UPDATED;
}

if (process.env?.GITHUB_CLIENT_SECRET) {
  GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
}

if (process.env?.SERVER_ERROR_MESSAGE) {
  SERVER_ERROR_MESSAGE = process.env.SERVER_ERROR_MESSAGE;
}

if (process.env?.SPECIALITIES_DELETED) {
  SPECIALITIES_DELETED = process.env.SPECIALITIES_DELETED;
}

if (process.env?.PERMISSIONS_ASSIGNED) {
  PERMISSIONS_ASSIGNED = process.env.PERMISSIONS_ASSIGNED;
}

if (process.env?.EXPIRES_AT && !isNaN(Number(process.env.EXPIRES_AT))) {
  EXPIRES_AT = +process.env.EXPIRES_AT;
}

export {
  HOME,
  HOST,
  DAYS,
  URLS,
  LOGIN,
  SIGNUP,
  FORGET,
  RESUME,
  SESSION,
  GIT_HUB,
  MAIL_TO,
  MIN_DATE,
  MAX_DATE,
  USER_DIR,
  DASHBOARD,
  WHATS_APP,
  LINKED_IN,
  ROLE_ADDED,
  EXPIRES_AT,
  AUTH_ERROR,
  ADMIN_ROLE,
  ADMIN_NAME,
  SMTP_EMAIL,
  CARDS_DATA,
  ADMIN_EMAIL,
  DOCTOR_ROLE,
  CHARTS_DATA,
  USER_DELETED,
  DEFAULT_ROLE,
  TOKEN_EXPIRED,
  CONFIRM_EMAIL,
  USERS_DELETED,
  IS_PRODUCTION,
  SMTP_PASSWORD,
  PUBLIC_ROUTES,
  SIDEBAR_ITEMS,
  INVALID_INPUTS,
  USER_NOT_FOUND,
  EMAIL_VERIFIED,
  ROLES_ASSIGNED,
  ADMIN_PASSWORD,
  SMTP_HOST_NAME,
  PAGE_NOT_FOUND,
  EMAIL_NOT_FOUND,
  TOKEN_NOT_FOUND,
  PROFILE_UPDATED,
  EMAIL_REGISTERED,
  SPECIALITY_ADDED,
  DATABASE_UPDATED,
  PERMISSION_ADDED,
  SMTP_PORT_NUMBER,
  GITHUB_CLIENT_ID,
  DEFAULT_PERMISSION,
  SPECIALITY_DELETED,
  SPECIALITY_UPDATED,
  GITHUB_CLIENT_SECRET,
  SERVER_ERROR_MESSAGE,
  SPECIALITIES_DELETED,
  PERMISSIONS_ASSIGNED
};
