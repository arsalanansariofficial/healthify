import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sql } from 'drizzle-orm';

import { relations } from '@/lib/db/schema';
import { env } from '@/lib/config';

export const db = drizzle(env.DATABASE_URL, { relations });
db.run(sql`pragma foreign_keys = on`);
