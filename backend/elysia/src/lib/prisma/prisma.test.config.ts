import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import { config } from 'dotenv';

config({ path: '.env.test.local', override: true });

export default defineConfig({
  datasource: { url: env('DATABASE_URL') },
  migrations: { path: 'migrations' },
  schema: 'schema.prisma'
});
