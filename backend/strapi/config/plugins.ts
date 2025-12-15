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

export default function config({
  env
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin {
  return {
    email: {
      config: {
        providerOptions: {
          auth: { pass: env('SMTP_PASSWORD'), user: env('SMTP_USER') },
          host: env('SMTP_HOST'),
          port: env('SMTP_PORT')
        },
        settings: {
          defaultReplyTo: env('SMTP_USER'),
          defaultFrom: env('SMTP_USER')
        },
        provider: 'nodemailer'
      }
    },
    'users-permissions': {
      config: {
        register: { allowedFields: ['name'] },
        sessions: { httpOnly: true },
        jwt: { expiresIn: '30d' },
        jwtManagement: 'refresh'
      }
    },
    upload: {
      config: {
        security: {
          deniedTypes: deniedExecutableTypes,
          allowedTypes: allowedMediaTypes
        }
      }
    }
  };
}
