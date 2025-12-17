import { env } from '@/lib/utils';

export const UI = {
  UNIQUE_ERROR: env('UNIQUE_ERROR', '⚠️ Record already exists!'),
  DEFAULT_PROFILE_IMAGE: env('DEFAULT_PROFILE_IMAGE', '/user.jpeg'),
  FILE_REMOVED: env('FILE_REMOVED', '🎉 File removed successfully.'),
  FILE_UPLOADED: env('FILE_UPLOADED', '🎉 File uploaded successfully.')
} as const;
