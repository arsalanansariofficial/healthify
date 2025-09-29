import { env } from '@/lib/utils';

export const PERMISSIONS = {
  DEFAULT: env('DEFAULT_PERMISSION', 'VIEW:DASHBOARD')
};
