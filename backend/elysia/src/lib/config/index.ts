import z from 'zod';

export const envSchema = z.object({
  BETTER_AUTH_ACCEPT_METHODS: z
    .array(z.enum(['POST', 'GET']))
    .default(['POST', 'GET']),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  MAX_FILE_SIZE: z.coerce.number().default(1 * 1_000 * 1_000),
  BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
  JWT_EXPIRES_IN: z.coerce.number().default(60 * 60 * 1000),
  SALT: z.union([z.coerce.number(), z.string()]).default(8),
  MIN_FILE_SIZE: z.coerce.number().default(10 * 1_000),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  UPLOAD_DIR: z.string().default('public'),
  GITHUB_CLIENT_ID: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32),
  SMTP_PASSWORD: z.string(),
  SMTP_EMAIL: z.string(),
  DATABASE_URL: z.url()
});

export const env = envSchema.parse(process.env);
