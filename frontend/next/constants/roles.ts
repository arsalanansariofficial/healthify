import { env } from '@/lib/utils';

export const ROLES = {
  ADMIN: env('ADMIN_ROLE', 'admin'),
  USER: env('DEFAULT_ROLE', 'user'),
  DOCTOR: env('DOCTOR_ROLE', 'doctor')
} as const;
