import { env } from '@/lib/utils';

export const SMTP = {
  EMAIL: env('SMTP_EMAIL', 'email@domain.com'),
  ERRORS: {
    AUTH_FAILED: '⚠️ Authentication failed with SMTP server!',
    CONNECT_FAILED: '⚠️ Could not connect to SMTP server!',
    TIMEOUT: '⚠️ SMTP connection timed out!'
  },
  HOST: env('SMTP_HOST_NAME', 'smtp.gmail.com'),
  PASSWORD: env('SMTP_PASSWORD', 'password'),
  PORT: env('SMTP_PORT_NUMBER', 465)
} as const;
