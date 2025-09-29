import { env } from '@/lib/utils';

export const O_AUTH = {
  GITHUB: {
    GITHUB_CLIENT_ID: env('GITHUB_CLIENT_ID', 'GITHUB_CLIENT_ID'),
    GITHUB_CLIENT_SECRET: env('GITHUB_CLIENT_SECRET', 'GITHUB_CLIENT_SECRET')
  }
};
