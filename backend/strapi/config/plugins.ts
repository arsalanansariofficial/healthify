import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'application/vnd.openxmlformats-officedocument.*',
  'application/msword',
  'application/pdf',
  'text/plain',
  'text/csv',
  'image/*',
  'video/*',
  'audio/*'
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdos-program',
  'application/x-mach-binary',
  'application/x-msdownload',
  'application/x-executable',
  'application/x-dosexec',
  'text/x-shellscript',
  'application/x-sh'
];

export default function config(
  _env: Core.Config.Shared.ConfigParams
): Core.Config.Plugin {
  return {
    upload: {
      config: {
        security: {
          deniedTypes: deniedExecutableTypes,
          allowedTypes: allowedMediaTypes
        }
      }
    },
    'users-permissions': {
      config: { sessions: { httpOnly: true }, jwtManagement: 'refresh' }
    }
  };
}
