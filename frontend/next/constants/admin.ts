import { env } from '@/lib/utils';

export const ADMIN = {
  NAME: env('NAME', 'Admin User'),
  PASSWORD: env('PASSWORD', 'admin.user'),
  EMAIL: env('DEFAULT_ROLE', 'admin.user@healthify.com')
} as const;
