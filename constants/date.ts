import { env } from '@/lib/utils';

export const DATES = {
  DAYS: [
    { label: 'Sunday', value: 'sunday' },
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' }
  ] as const,
  DAYS_IN_MONTH: env('DAYS_IN_MONTH', 30),
  DAYS_IN_YEAR: env('DAYS_IN_YEAR', 365),
  EXPIRES_AT: env('EXPIRES_AT', 3600),
  MAX_DATE: env('MAX_DATE', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),

  MIN_DATE: env('MIN_DATE', new Date()),

  MONTHS: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ] as const
};
