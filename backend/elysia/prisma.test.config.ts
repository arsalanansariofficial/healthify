import { defineConfig, env } from 'prisma/config';
import { config } from 'dotenv';

config({ path: '.env.test.local', override: true });

export default defineConfig({
  migrations: { path: 'src/utils/prisma/migrations' },
  schema: 'src/utils/prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') }
});
