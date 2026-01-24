import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { env } from '@/utils/config';

import { PrismaClient } from '../../../generated/prisma/client';

export const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(env.DATABASE_URL)
});
