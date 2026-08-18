import { drizzle } from 'drizzle-orm/bun-sqlite';

import { env } from '@/lib/config';

export const db = drizzle(env.DATABASE_URL);
