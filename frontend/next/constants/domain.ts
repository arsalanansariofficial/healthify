import { env } from '@/lib/utils';

export const DOMAIN = { LOCAL: env('LOCAL', 'http://localhost:3000') };
