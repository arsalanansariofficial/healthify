import z from 'zod';

export const envSchema = z.object({
  JWT_SECRET: z
    .string({ error: 'JWT should be valid string.' })
    .min(32, { error: 'JWT should be atleast 32 characters.' }),
  DATABASE_URL: z.url({ error: 'DATABASE_URL should be valid url.' }),
  JWT_EXPIRES_IN: z.coerce.number().default(60 * 60 * 1000),
  NODE_ENV: z.enum(['PRODUCTION', 'DEV']).default('DEV'),
  PORT: z.coerce.number().default(3000)
});
