import { defineConfig } from 'drizzle-kit';

import { env } from '@/lib/config';

export default defineConfig({
  dbCredentials: { url: env.DATABASE_URL },
  migrations: { table: '__migrations__' },
  schema: 'src/lib/db/schema.ts',
  out: 'src/lib/db/migrations',
  dialect: 'sqlite'
});
