import { env } from '@/lib/utils';

export const DATES = {
  EXPIRES_AT: env('EXPIRES_AT', 3600),
  MIN_DATE: env('MIN_DATE', new Date()),
  DAYS_IN_YEAR: env('DAYS_IN_YEAR', 365),
  DAYS_IN_MONTH: env('DAYS_IN_MONTH', 30),
  MAX_DATE: env('MAX_DATE', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),

  DAYS: [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' }
  ] as const,

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
