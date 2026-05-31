import z from 'zod';

export const envSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .default('aJEj11jdjesEdzi8AuGGA2G4FzZ9YbWA')
    .meta({
      description:
        'Random hash value for better-auth to hash passwords, defaults to aJEj11jdjesEdzi8AuGGA2G4FzZ9YbWA.'
    }),
  BETTER_AUTH_ACCEPT_METHODS: z
    .array(z.enum(['POST', 'GET']))
    .default(['POST', 'GET'])
    .meta({
      description:
        'HTTP authentication methods for better-auth, defaults to POST and GET methods.'
    }),
  GITHUB_CLIENT_SECRET: z
    .string()
    .optional()
    .meta({
      description:
        'OAuth application password to verify with the GitHub provider, ex: example_secret_1234567890abcdef.'
    }),
  BETTER_AUTH_COOKIE_CACHE_TIMEOUT: z.coerce
    .number()
    .default(15 * 60)
    .meta({
      description:
        'Time until the session cookie is cached (seconds), defaults to 15 minutes.'
    }),
  BETTER_AUTH_SESSION_EXPIRES_IN: z.coerce
    .number()
    .default(60 * 60)
    .meta({
      description:
        'Time remaining until automatic logout (seconds), defaults to 1 hour.'
    }),
  AXIOS_REQUEST_TIMEOUT: z.coerce
    .number()
    .default(5 * 1000)
    .meta({
      description:
        'Timeout for failing network requests (milliseconds), defaults to 5 seconds.'
    }),
  UPLOAD_DIR: z
    .string()
    .default('public')
    .meta({
      description:
        'Directory to which all images, files, documents etc. should be uploaded, defaults to public.'
    }),
  MAX_FILE_SIZE: z.coerce
    .number()
    .default(1 * 1_000 * 1_000)
    .meta({
      description:
        'Maximum number of bytes for a valid file upload, defaults to 1 MB.'
    }),
  GITHUB_CLIENT_ID: z
    .string()
    .optional()
    .meta({
      description:
        'OAuth application name to verify with the GitHub provider, ex: Iv1.example123456789.'
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .meta({
      description: 'Server running environment, defaults to development.'
    }),
  MIN_FILE_SIZE: z.coerce
    .number()
    .default(10 * 1_000)
    .meta({
      description:
        'Minimum number of bytes for a valid file upload, defaults to 10 KB.'
    }),

  SMTP_URL: z
    .string()
    .meta({
      description:
        'Password for SMTP server, ex: smtps://username@domain.com:password@smtp.example.com:465.'
    }),
  PORT: z.coerce
    .number()
    .default(3000)
    .meta({
      description:
        'Port at which the elysia server is running, defaults to 3000.'
    }),
  DATABASE_URL: z
    .url()
    .meta({
      description:
        'Database connection url, ex: mysql://user:password@localhost:3306/database-name'
    }),
  BETTER_AUTH_URL: z
    .url()
    .meta({
      description:
        'Server url of better-auth, defaults to http://localhost:3000.'
    })
});

export const env = envSchema.parse(process.env);
