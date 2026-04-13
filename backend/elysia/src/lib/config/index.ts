import z from 'zod';

export const envSchema = z.object({
  BETTER_AUTH_ACCEPT_METHODS: z
    .tuple([
      z.string({ error: 'Method name should be valid string.' }),
      z.string({ error: 'Method name should be valid string.' })
    ])
    .default(['POST', 'GET']),
  BETTER_AUTH_SECRET: z
    .string({ error: 'BETTER_AUTH_SECRET should be valid string.' })
    .min(32, { error: 'BETTER_AUTH_SECRET should be atleast 32 characters.' }),
  JWT_SECRET: z
    .string({ error: 'JWT should be valid string.' })
    .min(32, { error: 'JWT should be atleast 32 characters.' }),
  GITHUB_CLIENT_SECRET: z
    .string({ error: 'GITHUB_CLIENT_SECRET should be valid string.' })
    .optional(),
  GITHUB_CLIENT_ID: z
    .string({ error: 'GITHUB_CLIENT_ID should be valid string.' })
    .optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.url({ error: 'DATABASE_URL should be valid url.' }),
  JWT_EXPIRES_IN: z.coerce.number().default(60 * 60 * 1000),
  SALT: z.union([z.coerce.number(), z.string()]).default(8),
  UPLOAD_DIR: z.string().default('public'),
  PORT: z.coerce.number().default(3000)
});

export const env = envSchema.parse(process.env);
