import { env } from '@/lib/utils';

export const ENVIRONMENT = {
  IS_PRODUCTION: env('IS_PRODUCTION', false)
};
