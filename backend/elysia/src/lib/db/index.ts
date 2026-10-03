import { drizzle } from 'drizzle-orm/bun-sqlite';

import { relations } from '@/lib/db/schema';
import { env } from '@/lib/config';

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const db = drizzle(env.DATABASE_URL, { relations });
