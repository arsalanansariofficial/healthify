import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '~/generated/prisma/client';
import { env } from '@/utils/config';

export const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(env.DATABASE_URL)
});
