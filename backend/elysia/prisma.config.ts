import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  migrations: { path: 'src/utils/prisma/migrations' },
  schema: 'src/utils/prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') }
});
