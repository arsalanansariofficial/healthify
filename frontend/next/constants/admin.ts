import { env } from '@/lib/utils';

export const ADMIN = {
  EMAIL: env('DEFAULT_ROLE', 'admin.user@healthify.com'),
  NAME: env('NAME', 'Admin User'),
  PASSWORD: env('PASSWORD', 'admin.user')
} as const;
