import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  migrations: { path: 'src/prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
  schema: 'src/prisma/schema.prisma'
});
