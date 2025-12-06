export const HOME = '/';
export const LOGIN = '/login';
export const ABOUT = '/about';
export const SIGNUP = '/signup';
export const ACCOUNT = '/account';

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
export const ADMIN_ROLE = process.env?.ADMIN_ROLE || 'admin';

export const SMTP_TIME_OUT = '⚠️ SMTP connection timed out!';
export const DEFAULT_ROLE = process.env?.DEFAULT_ROLE || 'user';
export const DOCTOR_ROLE = process.env?.DOCTOR_ROLE || 'doctor';

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
export const PUBLIC_DIR = (process.env?.PUBLIC_DIR as string) || '/public';
export const HOST = (process.env?.HOST as string) || 'http://localhost:3000';

export const MAIL_TO = `mailto:${EMAIL}?subject=Mail%20To%20Arsalan%20Ansari`;
export const SMTP_HOST_NAME = process.env?.SMTP_HOST_NAME || 'smtp.gmail.com';
export const PAGE_NOT_FOUND = process.env?.PAGE_NOT_FOUND || 'Page not found!';

export const TOKEN_NOT_GENERATED = '⚠️ Failed to generate verification token!';
export const RESUME = `${CDN}/${USER_NAME}/${RESOURCE}/documents/arsalan-ansari_resume.pdf`;

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

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
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

export const URLS = [
  { value: '/roles', permission: 'view:roles' },
  { value: '/users', permission: 'view:users' },
  { value: '/roles/add', permission: 'add:role' },
  { value: '/doctors', permission: 'view:doctors' },
  { value: '/doctors/add', permission: 'add:doctor' },
  { value: '/dashboard', permission: 'view:dashboard' },
  { value: '/roles/assign', permission: 'assign:roles' },
  { value: '/permissions', permission: 'view:permissions' },
  { value: '/appointments', permission: 'view:appointments' },
  { value: '/permissions/add', permission: 'add:permission' },
  { value: '/permissions/assign', permission: 'assign:permissions' },
  { value: '/doctors/specialities/add', permission: 'add:speciality' },
  { value: '/appointments/[slug]/receipt', permission: 'view:receipt' }
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
    { label: 'Doctors', permission: 'view:doctors' },
    [
      { label: 'View', url: '/doctors', permission: 'view:doctors' },
      { label: 'Add', url: '/doctors/add', permission: 'add:doctor' }
    ]
  ],
  [
    { label: 'Hospitals', permission: 'view:hospitals' },
    [
      { label: 'View', url: '/hospitals', permission: 'view:hospitals' },
      { label: 'Add', url: '/hospitals/add', permission: 'add:hospital' }
    ]
  ],
  [
    { label: 'Departments', permission: 'view:departments' },
    [
      { label: 'View', url: '/departments', permission: 'view:departments' },
      { label: 'Add', url: '/departments/add', permission: 'add:department' }
    ]
  ],
  [
    { label: 'Facilities', permission: 'view:facilities' },
    [
      { label: 'View', url: '/facilities', permission: 'view:facilities' },
      { label: 'Add', url: '/facilities/add', permission: 'add:facility' }
    ]
  ],
  [
    { label: 'Pharma Brands', permission: 'view:pharma-brands' },
    [
      {
        label: 'View',
        url: '/pharma-brands',
        permission: 'view:pharma-brands'
      },
      {
        label: 'Add',
        url: '/pharma-brands/add',
        permission: 'add:pharma-brand'
      }
    ]
  ],
  [
    { label: 'Pharma Codes', permission: 'view:pharma-codes' },
    [
      {
        label: 'View',
        url: '/pharma-codes',
        permission: 'view:pharma-codes'
      },
      {
        label: 'Add',
        url: '/pharma-codes/add',
        permission: 'add:pharma-code'
      }
    ]
  ],
  [
    { label: 'Pharma Salt', permission: 'view:pharma-salts' },
    [
      {
        label: 'View',
        url: '/pharma-salts',
        permission: 'view:pharma-salts'
      },
      {
        label: 'Add',
        url: '/pharma-salts/add',
        permission: 'add:pharma-salt'
      }
    ]
  ],
  [
    { label: 'Medication Forms', permission: 'view:medication-forms' },
    [
      {
        label: 'View',
        url: '/medication-forms',
        permission: 'view:medication-forms'
      },
      {
        label: 'Add',
        url: '/medication-forms/add',
        permission: 'add:medication-form'
      }
    ]
  ],
  [
    { label: 'Pharma Manufacturers', permission: 'view:pharma-manufacturers' },
    [
      {
        label: 'View',
        url: '/pharma-manufacturers',
        permission: 'view:pharma-manufacturers'
      },
      {
        label: 'Add',
        url: '/pharma-manufacturers/add',
        permission: 'add:pharma-manufacturer'
      }
    ]
  ],
  [
    { label: 'Appointments', permission: 'view:appointments' },
    [{ label: 'View', url: '/appointments', permission: 'view:appointments' }]
  ],
  [
    { label: 'Specialities', permission: 'view:specialities' },
    [
      { label: 'View', url: '/specialities', permission: 'view:specialities' },
      { label: 'Add', url: '/specialities/add', permission: 'add:speciality' }
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
  ]
]);

export let EXPIRES_AT = 3600;
export let SMTP_PORT_NUMBER = 465;
export let DEFAULT_USER_PROFILE = `/user.jpeg`;
export let INVALID_INPUTS = '⚠️ Invalid inputs!';

export let GITHUB_CLIENT_ID = 'GITHUB_CLIENT_ID';
export let DEFAULT_PERMISSION = 'VIEW:DASHBOARD';
export let TOKEN_EXPIRED = '⚠️ Token has expired!';

export let ROLE_ADDED = '🎉 Role added successfully!';
export let USER_NOT_FOUND = '⚠️ User does not exist!';
export let ADMIN_EMAIL = 'admin.user@ansari.dashboard';

export let UPLOAD_FAILED = '⚠️ Failed to upload file!';
export let DELETE_FAILED = '⚠️ Failed to delete file!';
export let EMAIL_NOT_FOUND = "⚠️ Email doesn't exist!";

export let INVALID_TIME_SLOT = '⚠️ Invalid time slot!';
export let TOKEN_NOT_FOUND = "⚠️ Token doesn't exist!";
export let CONFIRM_EMAIL = '🎉 Confirmation email sent.';

export let IMAGE_NOT_FOUND = '⚠️ Image does not exist!';
export let USER_DELETED = '🎉 User deleted successfully.';
export let FILE_REMOVED = '🎉 File removed successfully.';

export let EMAIL_BOUNCED = '⚠️ Email address not found!';
export let GITHUB_CLIENT_SECRET = 'GITHUB_CLIENT_SECRET';
export let USERS_DELETED = '🎉 Users deleted successfully.';
export let HOSPITAL_ADDED = '🎉 Hospital added successfully';
export let HOSPITAL_UPDATED = '🎉 Hospital updated successfully';
export let DEPARTMENT_ADDED = '🎉 Department added successfully';
export let DEPARTMENT_UPDATED = '🎉 Department updated successfully';
export let DEPARTMENT_DELETED = '🎉 Department deleted successfully.';
export let DEPARTMENTS_DELETED = '🎉 Departments deleted successfully.';
export let FACILITY_ADDED = '🎉 Facility added successfully';
export let FACILITY_UPDATED = '🎉 Facility updated successfully';
export let FACILITY_DELETED = '🎉 Facility deleted successfully.';
export let FACILITIES_DELETED = '🎉 Facilities deleted successfully.';

export let PHARMA_CODE_ADDED = '🎉 Pharma code added successfully';
export let PHARMA_CODE_UPDATED = '🎉 Pharma code updated successfully';
export let PHARMA_CODE_DELETED = '🎉 Pharma code deleted successfully.';
export let PHARMA_CODES_DELETED = '🎉 Pharma code deleted successfully.';

export let PHARMA_MANUFACTURER_ADDED =
  '🎉 Pharma manufacture added successfully';
export let PHARMA_MANUFACTURER_UPDATED =
  '🎉 Pharma manufacture updated successfully';
export let PHARMA_MANUFACTURER_DELETED =
  '🎉 Pharma manufacture deleted successfully.';
export let PHARMA_MANUFACTURERS_DELETED =
  '🎉 Pharma manufacturers deleted successfully.';

export let PHARMA_SALT_ADDED = '🎉 Pharma salt added successfully';
export let PHARMA_SALT_UPDATED = '🎉 Pharma salt updated successfully';
export let PHARMA_SALT_DELETED = '🎉 Pharma salt deleted successfully.';
export let PHARMA_SALTS_DELETED = '🎉 Pharma salts deleted successfully.';

export let PHARMA_BRAND_ADDED = '🎉 Pharma brand added successfully';
export let PHARMA_BRAND_UPDATED = '🎉 Pharma brand updated successfully';
export let PHARMA_BRAND_DELETED = '🎉 Pharma brand deleted successfully.';
export let PHARMA_BRANDS_DELETED = '🎉 Pharma brands deleted successfully.';

export let MEDICATION_FORM_ADDED = '🎉 Medication form added successfully';
export let MEDICATION_FORM_UPDATED = '🎉 Medication form updated successfully';
export let MEDICATION_FORM_DELETED = '🎉 Medication form deleted successfully.';
export let MEDICATION_FORMS_DELETED =
  '🎉 Medication form deleted successfully.';

export let FILE_UPLOADED = '🎉 File uploaded successfully.';
export let EMAIL_REGISTERED = '⚠️ Email already registered!';
export let EMAIL_VERIFIED = '🎉 Email verified successfully.';

export let SERVER_ERROR_MESSAGE = '⚠️ Something went wrong!';
export let APPOINTMENT_CANCELLED = '💬 Appointment cancelled.';
export let PROFILE_UPDATED = '🎉 Profile updated successfully.';

export let ROLES_ASSIGNED = '🎉 Roles are assigned successfully.';
export let SPECIALITY_ADDED = '🎉 Speciality added successfully!';
export let DATABASE_UPDATED = '🎉 Database updated successfully.';

export let PERMISSION_ADDED = '🎉 Permission added successfully.';
export let APPOINTMENT_EXISTS = '⚠️ Appointment already exists!';
export let SPECIALITY_UPDATED = '🎉 Speciality updated successfully.';

export let SPECIALITY_DELETED = '🎉 Speciality deleted successfully.';
export let SPECIALITIES_DELETED = '🎉 Specialities deleted successfully.';
export let UN_AUTHORIZED = '⚠️ You are not authorized to perform this action!';

export let PERMISSIONS_ASSIGNED =
  '🎉 All permissions are assigned successfully.';

export let APPOINTMENT_NOT_FOUND =
  '⚠️ No details found for the current appointment!';

export let APPOINTMENT_ACTION_RESTRICTED =
  '⚠️ Appointment status can not be updated!';

export let APPOINTMENT_CONFIRMED =
  '🎉 Appointment confirmed, you can print appointment receipt now.';

export let APPOINTMENT_CREATED =
  '💬 We have informed the doctor about the appointment, once he confirms your appointment you would be able to get the receipt.';

if (process.env?.ROLE_ADDED) ROLE_ADDED = process.env.ROLE_ADDED;
if (process.env?.ADMIN_EMAIL) ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (process.env?.USER_DELETED) USER_DELETED = process.env.USER_DELETED;

if (process.env?.FILE_REMOVED) FILE_REMOVED = process.env.FILE_REMOVED;
if (process.env?.USERS_DELETED) USERS_DELETED = process.env.USERS_DELETED;
if (process.env?.TOKEN_EXPIRED) TOKEN_EXPIRED = process.env.TOKEN_EXPIRED;

if (process.env?.CONFIRM_EMAIL) CONFIRM_EMAIL = process.env.CONFIRM_EMAIL;
if (process.env?.FILE_UPLOADED) FILE_UPLOADED = process.env.FILE_UPLOADED;
if (process.env?.UPLOAD_FAILED) UPLOAD_FAILED = process.env.UPLOAD_FAILED;

if (process.env?.DELETE_FAILED) DELETE_FAILED = process.env.DELETE_FAILED;
if (process.env?.EMAIL_BOUNCED) EMAIL_BOUNCED = process.env.EMAIL_BOUNCED;
if (process.env?.EMAIL_VERIFIED) EMAIL_VERIFIED = process.env.EMAIL_VERIFIED;

if (process.env?.INVALID_INPUTS) INVALID_INPUTS = process.env.INVALID_INPUTS;
if (process.env?.USER_NOT_FOUND) USER_NOT_FOUND = process.env.USER_NOT_FOUND;
if (process.env?.ROLES_ASSIGNED) ROLES_ASSIGNED = process.env.ROLES_ASSIGNED;

if (process.env?.UN_AUTHORIZED) UN_AUTHORIZED = process.env.UN_AUTHORIZED;
if (process.env?.IMAGE_NOT_FOUND) IMAGE_NOT_FOUND = process.env.IMAGE_NOT_FOUND;
if (process.env?.PROFILE_UPDATED) PROFILE_UPDATED = process.env.PROFILE_UPDATED;

if (process.env?.HOSPITAL_ADDED) HOSPITAL_ADDED = process.env.HOSPITAL_ADDED;
if (process.env?.EMAIL_NOT_FOUND) EMAIL_NOT_FOUND = process.env.EMAIL_NOT_FOUND;
if (process.env?.TOKEN_NOT_FOUND) TOKEN_NOT_FOUND = process.env.TOKEN_NOT_FOUND;

if (process.env?.HOSPITAL_UPDATED)
  HOSPITAL_UPDATED = process.env.HOSPITAL_UPDATED;

if (process.env?.DEPARTMENT_ADDED)
  DEPARTMENT_ADDED = process.env.DEPARTMENT_ADDED;
if (process.env?.DEPARTMENT_UPDATED)
  DEPARTMENT_UPDATED = process.env.DEPARTMENT_UPDATED;
if (process.env?.DEPARTMENT_DELETED)
  DEPARTMENT_DELETED = process.env.DEPARTMENT_DELETED;
if (process.env?.DEPARTMENTS_DELETED)
  DEPARTMENTS_DELETED = process.env.DEPARTMENTS_DELETED;

if (process.env?.FACILITY_ADDED) FACILITY_ADDED = process.env.FACILITY_ADDED;
if (process.env?.FACILITY_UPDATED)
  FACILITY_UPDATED = process.env.FACILITY_UPDATED;
if (process.env?.FACILITY_DELETED)
  FACILITY_DELETED = process.env.FACILITY_DELETED;
if (process.env?.FACILITIES_DELETED)
  FACILITIES_DELETED = process.env.FACILITIES_DELETED;

if (process.env?.PHARMA_CODE_ADDED)
  PHARMA_CODE_ADDED = process.env.PHARMA_CODE_ADDED;
if (process.env?.PHARMA_CODE_UPDATED)
  PHARMA_CODE_UPDATED = process.env.PHARMA_CODE_UPDATED;
if (process.env?.PHARMA_CODE_DELETED)
  PHARMA_CODE_DELETED = process.env.PHARMA_CODE_DELETED;
if (process.env?.PHARMA_CODES_DELETED)
  PHARMA_CODES_DELETED = process.env.PHARMA_CODES_DELETED;

if (process.env?.PHARMA_MANUFACTURER_ADDED)
  PHARMA_MANUFACTURER_ADDED = process.env.PHARMA_MANUFACTURER_ADDED;
if (process.env?.PHARMA_MANUFACTURER_UPDATED)
  PHARMA_MANUFACTURER_UPDATED = process.env.PHARMA_MANUFACTURER_UPDATED;
if (process.env?.PHARMA_MANUFACTURER_DELETED)
  PHARMA_MANUFACTURER_DELETED = process.env.PHARMA_MANUFACTURER_DELETED;
if (process.env?.PHARMA_MANUFACTURERS_DELETED)
  PHARMA_MANUFACTURERS_DELETED = process.env.PHARMA_MANUFACTURERS_DELETED;

if (process.env?.PHARMA_SALT_ADDED)
  PHARMA_SALT_ADDED = process.env.PHARMA_SALT_ADDED;
if (process.env?.PHARMA_SALT_UPDATED)
  PHARMA_SALT_UPDATED = process.env.PHARMA_SALT_UPDATED;
if (process.env?.PHARMA_SALT_DELETED)
  PHARMA_SALT_DELETED = process.env.PHARMA_SALT_DELETED;
if (process.env?.PHARMA_SALTS_DELETED)
  PHARMA_SALTS_DELETED = process.env.PHARMA_SALTS_DELETED;

if (process.env?.PHARMA_BRAND_ADDED)
  PHARMA_BRAND_ADDED = process.env.PHARMA_BRAND_ADDED;
if (process.env?.PHARMA_BRAND_UPDATED)
  PHARMA_BRAND_UPDATED = process.env.PHARMA_BRAND_UPDATED;
if (process.env?.PHARMA_BRAND_DELETED)
  PHARMA_BRAND_DELETED = process.env.PHARMA_BRAND_DELETED;
if (process.env?.PHARMA_BRANDS_DELETED)
  PHARMA_BRANDS_DELETED = process.env.PHARMA_BRANDS_DELETED;

if (process.env?.MEDICATION_FORM_ADDED)
  MEDICATION_FORM_ADDED = process.env.MEDICATION_FORM_ADDED;
if (process.env?.MEDICATION_FORM_UPDATED)
  MEDICATION_FORM_UPDATED = process.env.MEDICATION_FORM_UPDATED;
if (process.env?.MEDICATION_FORM_DELETED)
  MEDICATION_FORM_DELETED = process.env.MEDICATION_FORM_DELETED;
if (process.env?.MEDICATION_FORMS_DELETED)
  MEDICATION_FORMS_DELETED = process.env.MEDICATION_FORMS_DELETED;

if (process.env?.GITHUB_CLIENT_ID)
  GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

if (process.env?.EMAIL_REGISTERED)
  EMAIL_REGISTERED = process.env.EMAIL_REGISTERED;

if (process.env?.SPECIALITY_ADDED)
  SPECIALITY_ADDED = process.env.SPECIALITY_ADDED;

if (process.env?.DATABASE_UPDATED)
  DATABASE_UPDATED = process.env.DATABASE_UPDATED;

if (process.env?.DEFAULT_USER_PROFILE)
  DEFAULT_USER_PROFILE = process.env.DEFAULT_USER_PROFILE;

if (process.env?.PERMISSION_ADDED)
  PERMISSION_ADDED = process.env.PERMISSION_ADDED;

if (process.env?.INVALID_TIME_SLOT)
  INVALID_TIME_SLOT = process.env.INVALID_TIME_SLOT;

if (process.env?.SPECIALITY_UPDATED)
  SPECIALITY_UPDATED = process.env.SPECIALITY_UPDATED;

if (process.env?.SPECIALITY_DELETED)
  SPECIALITY_DELETED = process.env.SPECIALITY_DELETED;

if (process.env?.DEFAULT_PERMISSION)
  DEFAULT_PERMISSION = process.env.DEFAULT_PERMISSION;

if (process.env?.APPOINTMENT_EXISTS)
  APPOINTMENT_EXISTS = process.env.APPOINTMENT_EXISTS;

if (process.env?.APPOINTMENT_CREATED)
  APPOINTMENT_CREATED = process.env.APPOINTMENT_CREATED;

if (process.env?.SPECIALITIES_DELETED)
  SPECIALITIES_DELETED = process.env.SPECIALITIES_DELETED;

if (process.env?.PERMISSIONS_ASSIGNED)
  PERMISSIONS_ASSIGNED = process.env.PERMISSIONS_ASSIGNED;

if (process.env?.GITHUB_CLIENT_SECRET)
  GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (process.env?.SERVER_ERROR_MESSAGE)
  SERVER_ERROR_MESSAGE = process.env.SERVER_ERROR_MESSAGE;

if (process.env?.APPOINTMENT_NOT_FOUND)
  APPOINTMENT_NOT_FOUND = process.env.APPOINTMENT_NOT_FOUND;

if (process.env?.APPOINTMENT_CONFIRMED)
  APPOINTMENT_CONFIRMED = process.env.APPOINTMENT_CONFIRMED;

if (process.env?.APPOINTMENT_CANCELLED)
  APPOINTMENT_CANCELLED = process.env.APPOINTMENT_CANCELLED;

if (!isNaN(Number(process.env?.SMTP_PORT_NUMBER)))
  SMTP_PORT_NUMBER = +process.env.SMTP_PORT_NUMBER!;

if (process.env?.EXPIRES_AT && !isNaN(Number(process.env.EXPIRES_AT)))
  EXPIRES_AT = +process.env.EXPIRES_AT;

if (process.env?.APPOINTMENT_ACTION_RESTRICTED)
  APPOINTMENT_ACTION_RESTRICTED = process.env.APPOINTMENT_ACTION_RESTRICTED;
