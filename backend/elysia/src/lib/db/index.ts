import { drizzle } from 'drizzle-orm/bun-sqlite';

import { relations } from '@/lib/db/schema';
import { env } from '@/lib/config';

export const db = drizzle(env.DATABASE_URL, { relations });
