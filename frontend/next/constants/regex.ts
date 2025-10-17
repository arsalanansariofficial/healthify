import { env } from '@/lib/utils';

export const PHONE_REG_EX = env('PHONE_REG_EX', /^\+?\d{10,15}$/);

export const TIME_REG_EX = env(
  'TIME_REG_EX',
  /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
);
