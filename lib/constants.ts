export let ROLE_ADDED = '🎉 Role added successfully!';
if (process.env?.ROLE_ADDED) ROLE_ADDED = process.env.ROLE_ADDED;

export let ADMIN_EMAIL = 'admin.user@ansari.dashboard';
if (process.env?.ADMIN_EMAIL) ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export let USER_DELETED = '🎉 User deleted successfully.';
if (process.env?.USER_DELETED) USER_DELETED = process.env.USER_DELETED;

export let FILE_REMOVED = '🎉 File removed successfully.';
if (process.env?.FILE_REMOVED) FILE_REMOVED = process.env.FILE_REMOVED;

export let USERS_DELETED = '🎉 Users deleted successfully.';
if (process.env?.USERS_DELETED) USERS_DELETED = process.env.USERS_DELETED;

export let TOKEN_EXPIRED = '⚠️ Token has expired!';
if (process.env?.TOKEN_EXPIRED) TOKEN_EXPIRED = process.env.TOKEN_EXPIRED;

export let CONFIRM_EMAIL = '🎉 Confirmation email sent.';
if (process.env?.CONFIRM_EMAIL) CONFIRM_EMAIL = process.env.CONFIRM_EMAIL;

export let FILE_UPLOADED = '🎉 File uploaded successfully.';
if (process.env?.FILE_UPLOADED) FILE_UPLOADED = process.env.FILE_UPLOADED;

export let UPLOAD_FAILED = '⚠️ Failed to upload file!';
if (process.env?.UPLOAD_FAILED) UPLOAD_FAILED = process.env.UPLOAD_FAILED;

export let DELETE_FAILED = '⚠️ Failed to delete file!';
if (process.env?.DELETE_FAILED) DELETE_FAILED = process.env.DELETE_FAILED;

export let EMAIL_VERIFIED = '🎉 Email verified successfully.';
if (process.env?.EMAIL_VERIFIED) EMAIL_VERIFIED = process.env.EMAIL_VERIFIED;

export let INVALID_INPUTS = '⚠️ Invalid inputs!';
if (process.env?.INVALID_INPUTS) INVALID_INPUTS = process.env.INVALID_INPUTS;

export let USER_NOT_FOUND = '⚠️ User does not exist!';
if (process.env?.USER_NOT_FOUND) USER_NOT_FOUND = process.env.USER_NOT_FOUND;

export let IMAGE_NOT_FOUND = '⚠️ Image does not exist!';
if (process.env?.IMAGE_NOT_FOUND) IMAGE_NOT_FOUND = process.env.IMAGE_NOT_FOUND;

export let ROLES_ASSIGNED = '🎉 Roles are assigned successfully.';
if (process.env?.ROLES_ASSIGNED) ROLES_ASSIGNED = process.env.ROLES_ASSIGNED;

export let PROFILE_UPDATED = '🎉 Profile updated successfully.';
if (process.env?.PROFILE_UPDATED) PROFILE_UPDATED = process.env.PROFILE_UPDATED;

export let EMAIL_NOT_FOUND = "⚠️ Email doesn't exist!";
if (process.env?.EMAIL_NOT_FOUND) EMAIL_NOT_FOUND = process.env.EMAIL_NOT_FOUND;

export let TOKEN_NOT_FOUND = "⚠️ Token doesn't exist!";
if (process.env?.TOKEN_NOT_FOUND) {
  TOKEN_NOT_FOUND = process.env.TOKEN_NOT_FOUND;
}

export let EMAIL_REGISTERED = '⚠️ Email already registered!';
if (process.env?.EMAIL_REGISTERED) {
  EMAIL_REGISTERED = process.env.EMAIL_REGISTERED;
}

export let SPECIALITY_ADDED = '🎉 Speciality added successfully!';
if (process.env?.SPECIALITY_ADDED) {
  SPECIALITY_ADDED = process.env.SPECIALITY_ADDED;
}

export let DATABASE_UPDATED = '🎉 Database updated successfully.';
if (process.env?.DATABASE_UPDATED) {
  DATABASE_UPDATED = process.env.DATABASE_UPDATED;
}

export let PERMISSION_ADDED = '🎉 Permission added successfully.';
if (process.env?.PERMISSION_ADDED) {
  PERMISSION_ADDED = process.env.PERMISSION_ADDED;
}

export let GITHUB_CLIENT_ID = 'GITHUB_CLIENT_ID';
if (process.env?.GITHUB_CLIENT_ID) {
  GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
}

export let SPECIALITY_UPDATED = '🎉 Speciality updated successfully.';
if (process.env?.SPECIALITY_UPDATED) {
  SPECIALITY_UPDATED = process.env.SPECIALITY_UPDATED;
}

export let SPECIALITY_DELETED = '🎉 Speciality deleted successfully.';
if (process.env?.SPECIALITY_DELETED) {
  SPECIALITY_DELETED = process.env.SPECIALITY_DELETED;
}

export let DEFAULT_PERMISSION = 'VIEW:DASHBOARD';
if (process.env?.DEFAULT_PERMISSION) {
  DEFAULT_PERMISSION = process.env.DEFAULT_PERMISSION;
}

export let SPECIALITIES_DELETED = '🎉 Specialities deleted successfully.';
if (process.env?.SPECIALITIES_DELETED) {
  SPECIALITIES_DELETED = process.env.SPECIALITIES_DELETED;
}

export let PERMISSIONS_ASSIGNED =
  '🎉 All permissions are assigned successfully.';
if (process.env?.PERMISSIONS_ASSIGNED) {
  PERMISSIONS_ASSIGNED = process.env.PERMISSIONS_ASSIGNED;
}

export let GITHUB_CLIENT_SECRET = 'GITHUB_CLIENT_SECRET';
if (process.env?.GITHUB_CLIENT_SECRET) {
  GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
}

export let SERVER_ERROR_MESSAGE = '⚠️ Something went wrong!';
if (process.env?.SERVER_ERROR_MESSAGE) {
  SERVER_ERROR_MESSAGE = process.env.SERVER_ERROR_MESSAGE;
}

export let SMTP_PORT_NUMBER = 465;
if (!isNaN(Number(process.env?.SMTP_PORT_NUMBER))) {
  SMTP_PORT_NUMBER = +process.env.SMTP_PORT_NUMBER!;
}

export let EXPIRES_AT = 3600;
if (process.env?.EXPIRES_AT && !isNaN(Number(process.env.EXPIRES_AT))) {
  EXPIRES_AT = +process.env.EXPIRES_AT;
}

export const HOME = '/';
export const LOGIN = '/login';
export const SIGNUP = '/signup';

export const FORGET = '/forget';
export const RESPONSE_OK_CODE = 200;
export const BAD_REQUEST_CODE = 400;

export const SERVER_ERROR_CODE = 500;
export const DASHBOARD = '/dashboard';
export const AUTH_ERROR = '/auth-error';

export const RESPONSE_WRITTEN_CODE = 201;
export const APPOINTMENTS = '/appointments';
export const MIN_DATE = new Date(Date.now());

export const SESSION = 'authjs.session-token';
export const USER_NAME = 'arsalanansariofficial';
export const EMAIL = 'theansaricompany@gmail.com';

export const WHATS_APP = 'https://wa.link/dnq2t8';
export const RESOURCE = 'resources/refs/heads/main';
export const UNIQUE_ERR = '⚠️ Record already exists!';

export const CDN = 'https://raw.githubusercontent.com';
export const EMAIL_FAILED = '⚠️ Failed to send email!';
export const OCTET_STREAM = 'application/octet-stream';

export const SPACE_FULL = '⚠️ No space left on device!';
export const BAD_REQUEST_MESSAGE = '⚠️ 400 Bad request!';
export const ADMIN_ROLE = process.env?.ADMIN_ROLE || 'ADMIN';

export const SMTP_TIME_OUT = '⚠️ SMTP connection timed out!';
export const DEFAULT_ROLE = process.env?.DEFAULT_ROLE || 'USER';
export const DOCTOR_ROLE = process.env?.DOCTOR_ROLE || 'DOCTOR';

export const ADMIN_NAME = process.env?.ADMIN_NAME || 'Admin User';
export const INVALID_CREDENTIALS = '⚠️ Invalid email or password!';
export const INVALID_IMAGE_FORMAT = '⚠️ Image format is not valid!';

export const IS_PRODUCTION = process.env?.NODE_ENV === 'production';
export const DIRECTORY_NOT_FOUND = '⚠️ Upload directory not found!';
export const PRISMA_INIT = '⚠️ Failed to initialize prisma client!';

export const WEBSITE = `https://${USER_NAME}.github.io/${USER_NAME}`;
export const LINKED_IN = `https://www.linkedin.com/in/${USER_NAME}/`;
export const SMTP_PASSWORD = process.env?.SMTP_PASSWORD || 'password';

export const GIT_HUB = `https://github.com/${USER_NAME}/${USER_NAME}`;
export const E_CONNECT_FAILED = '⚠️ Could not connect to SMTP server!';
export const MAX_DATE = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

export const SMTP_EMAIL = process.env?.SMTP_EMAIL || 'email@domain.com';
export const ADMIN_PASSWORD = process.env?.ADMIN_PASSWORD || 'admin.user';
export const E_AUTH_FAILED = '⚠️ Authentication failed with SMTP server!';

export const PERMISSION_DENIED = '⚠️ Permission denied while saving file!';
export const HOST = (process.env?.HOST as string) || 'http://localhost:3000';
export const USER_DIR = (process.env?.USER_DIR as string) || '/public/users';

export const MAIL_TO = `mailto:${EMAIL}?subject=Mail%20To%20Arsalan%20Ansari`;
export const SMTP_HOST_NAME = process.env?.SMTP_HOST_NAME || 'smtp.gmail.com';
export const PAGE_NOT_FOUND = process.env?.PAGE_NOT_FOUND || 'Page not found!';

export const TOKEN_NOT_GENERATED = '⚠️ Failed to generate verification token!';
export const RESUME = `${CDN}/${USER_NAME}/${RESOURCE}/documents/arsalan-ansari_resume.pdf`;

export let APPOINTMENT_CREATED =
  '💬 We have informed the doctor about the appointment, once he confirms your appointment you would be able to get the receipt.';
if (process.env?.APPOINTMENT_CREATED) {
  APPOINTMENT_CREATED = process.env.APPOINTMENT_CREATED;
}

export const PUBLIC_ROUTES = [
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
  { value: 'SUNDAY', label: 'SUNDAY' },
  { value: 'MONDAY', label: 'MONDAY' },
  { value: 'FRIDAY', label: 'FRIDAY' },
  { value: 'TUESDAY', label: 'TUESDAY' },
  { value: 'THURSDAY', label: 'THURSDAY' },
  { value: 'SATURDAY', label: 'SATURDAY' },
  { value: 'WEDNESDAY', label: 'WEDNESDAY' }
];

export const URLS = [
  { value: '/roles', permission: 'view:roles' },
  { value: '/users', permission: 'view:users' },
  { value: '/roles/add', permission: 'add:role' },
  { value: '/doctors', permission: 'view:doctors' },
  { value: '/receipt', permission: 'view:receipt' },
  { value: '/doctors/add', permission: 'add:doctor' },
  { value: '/dashboard', permission: 'view:dashboard' },
  { value: '/roles/assign', permission: 'assign:roles' },
  { value: '/permissions', permission: 'view:permissions' },
  { value: '/appointments', permission: 'view:appointments' },
  { value: '/permissions/add', permission: 'add:permission' },
  { value: '/permissions/assign', permission: 'assign:permissions' },
  { value: '/doctors/specialities/add', permission: 'add:speciality' }
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

export const SIDEBAR_ITEMS = new Map([
  [
    { label: 'Home', permission: 'view:dashboard' },
    [{ url: '/dashboard', label: 'Dashboard', permission: 'view:dashboard' }]
  ],
  [
    { label: 'Doctors', permission: 'view:doctors' },
    [
      { label: 'View', url: '/doctors', permission: 'view:doctors' },
      { label: 'Add', url: '/doctors/add', permission: 'add:doctor' }
    ]
  ],
  [
    { label: 'Specialities', permission: 'view:specialities' },
    [
      { label: 'View', url: '/specialities', permission: 'view:specialities' },
      { label: 'Add', url: '/specialities/add', permission: 'add:speciality' }
    ]
  ],
  [
    { label: 'Appointments', permission: 'view:appointments' },
    [
      { label: 'View', url: '/appointments', permission: 'view:appointments' },
      {
        label: 'Receipt',
        permission: 'view:receipt',
        url: '/appointments/receipt'
      }
    ]
  ],
  [
    { label: 'Users', permission: 'view:users' },
    [{ url: '/users', label: 'View', permission: 'view:users' }]
  ],
  [
    { label: 'Roles', permission: 'view:roles' },
    [
      { label: 'Add', url: '/roles/add', permission: 'add:role' },
      { label: 'Assign', url: '/roles/assign', permission: 'assign:roles' }
    ]
  ],
  [
    { permission: 'view:permissions', label: 'Permissions' },
    [
      { label: 'Add', url: '/permissions/add', permission: 'add:permission' },
      {
        label: 'Assign',
        url: '/permissions/assign',
        permission: 'assign:permissions'
      }
    ]
  ],
  [
    { label: 'Account', permission: 'view:account' },
    [{ url: '/account', label: 'Profile', permission: 'view:account' }]
  ]
]);
