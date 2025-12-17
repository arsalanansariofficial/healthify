import { env } from '@/lib/utils';

export const SMTP = {
  PORT: env('SMTP_PORT_NUMBER', 465),
  PASSWORD: env('SMTP_PASSWORD', 'password'),
  EMAIL: env('SMTP_EMAIL', 'email@domain.com'),
  HOST: env('SMTP_HOST_NAME', 'smtp.gmail.com'),
  ERRORS: {
    TIMEOUT: '⚠️ SMTP connection timed out!',
    CONNECT_FAILED: '⚠️ Could not connect to SMTP server!',
    AUTH_FAILED: '⚠️ Authentication failed with SMTP server!'
  }
} as const;
