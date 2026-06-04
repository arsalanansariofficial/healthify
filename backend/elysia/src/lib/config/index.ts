import z from 'zod';

export const envSchema = z.object(
  {
    BETTER_AUTH_SECRET: z
      .string('BETTER_AUTH_SECRET should be a valid string.')
      .nonempty('BETTER_AUTH_SECRET should not be empty.')
      .min(32, 'BETTER_AUTH_SECRET should be at least 32 characters long.')
      .default('aJEj11jdjesEdzi8AuGGA2G4FzZ9YbWA')
      .meta({
        description:
          'Random hash value for better-auth to hash passwords, defaults to aJEj11jdjesEdzi8AuGGA2G4FzZ9YbWA.'
      }),
    GITHUB_CLIENT_SECRET: z
      .string('GITHUB_CLIENT_SECRET should be valid string.')
      .nonempty('GITHUB_CLIENT_SECRET should not be empty.')
      .optional()
      .meta({
        description:
          'OAuth application password to verify with the GitHub provider, ex: example_secret_1234567890abcdef.'
      }),
    BETTER_AUTH_ACCEPT_METHODS: z
      .array(
        z.enum(['post', 'get']),
        'BETTER_AUTH_SECRET should be valid http verb.'
      )
      .default(['post', 'get'])
      .meta({
        description:
          'HTTP authentication methods for better-auth, defaults to POST and GET methods.'
      }),
    BETTER_AUTH_COOKIE_CACHE_TIMEOUT: z.coerce
      .number(
        'BETTER_AUTH_COOKIE_CACHE_TIMEOUT should be a valid number in milliseconds.'
      )
      .default(15 * 60)
      .meta({
        description:
          'Time until the session cookie is cached (seconds), defaults to 15 minutes.'
      }),
    GITHUB_CLIENT_ID: z
      .string('GITHUB_CLIENT_ID should be a valid string.')
      .nonempty('GITHUB_CLIENT_ID should not be empty.')
      .optional()
      .meta({
        description:
          'OAuth application name to verify with the GitHub provider, ex: Iv1.example123456789.'
      }),
    UPLOAD_DIR: z
      .string('UPLOAD_DIR should be a valid string.')
      .nonempty('UPLOAD_DIR should not be empty.')
      .default('public')
      .meta({
        description:
          'Directory to which all images, files, documents etc. should be uploaded, defaults to public.'
      }),
    BETTER_AUTH_SESSION_EXPIRES_IN: z.coerce
      .number(
        'BETTER_AUTH_SESSION_EXPIRES_IN should be a valid number in seconds.'
      )
      .default(60 * 60)
      .meta({
        description:
          'Time remaining until automatic logout (seconds), defaults to 1 hour.'
      }),
    AXIOS_REQUEST_TIMEOUT: z.coerce
      .number('AXIOS_REQUEST_TIMEOUT should be a valid number in milliseconds.')
      .default(5 * 1000)
      .meta({
        description:
          'Timeout for failing network requests (milliseconds), defaults to 5 seconds.'
      }),
    NODE_ENV: z
      .enum(
        ['development', 'production', 'test'],
        'NODE_ENV should be a valid string.'
      )
      .default('development')
      .meta({
        description: 'Server running environment, defaults to development.'
      }),
    MAX_FILE_SIZE: z.coerce
      .number('MAX_FILE_SIZE should be a valid number in bytes.')
      .default(1 * 1_000 * 1_000)
      .meta({
        description:
          'Maximum number of bytes for a valid file upload, defaults to 1 MB.'
      }),
    MIN_FILE_SIZE: z.coerce
      .number('MIN_FILE_SIZE should be valid number in bytes.')
      .default(10 * 1_000)
      .meta({
        description:
          'Minimum number of bytes for a valid file upload, defaults to 10 KB.'
      }),
    SMTP_URL: z
      .url('SMTP_URL should be a valid url.')
      .meta({
        description:
          'Password for SMTP server, ex: smtps://username@domain.com:password@smtp.example.com:465.'
      }),
    DATABASE_URL: z
      .url('DATABASE_URL should be a valid url.')
      .meta({
        description:
          'Database connection url, ex: mysql://user:password@localhost:3306/database-name'
      }),
    PORT: z.coerce
      .number('PORT should be valid number.')
      .default(3000)
      .meta({
        description:
          'Port at which the elysia server is running, defaults to 3000.'
      }),
    BETTER_AUTH_URL: z
      .url('BETTER_AUTH_URL should be valid url.')
      .meta({
        description:
          'Server url of better-auth, defaults to http://localhost:3000.'
      })
  },
  'envSchema should be a valid object.'
);

export const env = envSchema.parse(process.env);
