import z from 'zod';

export const envSchema = z.object({
  JWT_SECRET: z
    .string({ error: 'JWT should be valid string.' })
    .min(32, { error: 'JWT should be atleast 32 characters.' }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.url({ error: 'DATABASE_URL should be valid url.' }),
  JWT_EXPIRES_IN: z.coerce.number().default(60 * 60 * 1000),
  UPLOAD_DIR: z.string().default('public'),
  PORT: z.coerce.number().default(3000)
});

export const env = envSchema.parse(process.env);
