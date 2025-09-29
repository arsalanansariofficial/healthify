import { env } from '@/lib/utils';

export const HTTP_MESSAGES = {
  BAD_REQUEST: env('BAD_REQUEST', '⚠️ 400 Bad request!'),
  SERVER_ERROR: env('SERVER_ERROR', '⚠️ Something went wrong!')
} as const;

export const HTTP_STATUS = {
  OK: env('OK', 200),
  CREATED: env('CREATED', 201),
  BAD_REQUEST: env('BAD_REQUEST', 400),
  SERVER_ERROR: env('SERVER_ERROR', 500)
} as const;
