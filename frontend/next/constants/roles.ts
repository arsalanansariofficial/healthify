import { env } from '@/lib/utils';

export const ROLES = {
  ADMIN: env('ADMIN_ROLE', 'admin'),
  DOCTOR: env('DOCTOR_ROLE', 'doctor'),
  USER: env('DEFAULT_ROLE', 'user')
} as const;
