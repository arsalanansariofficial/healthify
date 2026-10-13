import z from 'zod';

export const envSchema = z.object(
  {
    DATABASE_URL: z
      .union(
        [
          z
            .url('DATABASE_URL should be a valid url.')
            .nonempty('DATABASE_URL should not be empty.')
            .trim()
            .meta({
              description:
                'Database connection url, ex: mysql://user:password@localhost:3306/database-name'
            }),
          z
            .string('DATABASE_URL should be a valid string.')
            .nonempty('DATABASE_URL should not be empty.')
            .trim()
            .meta({
              description: 'Database file, ex: database.sqlite or database.db'
            })
        ],
        'DATABASE_URL should either be a valid url or a valid file name if using file based database.'
      )
      .default('healthify.db')
      .meta({
        description:
          'DATABASE_URL either a valid database server url or filename if using file based database (sqlite), defaults to healthify.db.'
      }),
    BETTER_AUTH_SECRET: z
      .string('BETTER_AUTH_SECRET should be a valid string.')
      .nonempty('BETTER_AUTH_SECRET should not be empty.')
      .min(32, 'BETTER_AUTH_SECRET should be at least 32 characters long.')
      .trim()
      .default('aJEj11jdjesEdzi8AuGGA2G4FzZ9YbWA')
      .meta({
        description:
          'Random hash value for better-auth to hash passwords, defaults to aJEj11jdjesEdzi8AuGGA2G4FzZ9YbWA.'
      }),
    GITHUB_CLIENT_SECRET: z
      .string('GITHUB_CLIENT_SECRET should be valid string.')
      .nonempty('GITHUB_CLIENT_SECRET should not be empty.')
      .trim()
      .default('example_secret_1234567890abcdef')
      .meta({
        description:
          'OAuth application password to verify with the GitHub provider, defaults to example_secret_1234567890abcdef.'
      }),
    IMAGE_API: z
      .url('IMAGE_API should be valid url.')
      .nonempty('IMAGE_API should not be empty.')
      .trim()
      .default('https://api.dicebear.com/10.x/squircles/svg')
      .meta({
        description:
          'An API to assign default images when a new user is created, defaults to https://api.dicebear.com/10.x/squircles/svg'
      }),
    COVER_API: z
      .url('COVER_API should be valid url.')
      .nonempty('COVER_API should not be empty.')
      .trim()
      .default('https://api.dicebear.com/10.x/waves/svg')
      .meta({
        description:
          'An API to assign default cover images when a new user is created, defaults to https://api.dicebear.com/10.x/waves/svg'
      }),
    BETTER_AUTH_SESSION_COOKIE_NAME: z
      .string('BETTER_AUTH_SESSION_COOKIE_NAME should be a valid string.')
      .nonempty('BETTER_AUTH_SESSION_COOKIE_NAME should not be empty.')
      .trim()
      .default('session_token')
      .meta({
        description:
          'Name of better-auth session cookie, defaults to session_token.'
      }),
    SMTP_URL: z
      .url('SMTP_URL should be a valid url.')
      .nonempty('SMTP_URL should not be empty.')
      .trim()
      .default('smtps://username@gmail.com:password@smtp.gmail.com:465')
      .meta({
        description:
          'Password for SMTP server, ex: smtps://username@domain.com:password@smtp.example.com:465.'
      }),
    GITHUB_CLIENT_ID: z
      .string('GITHUB_CLIENT_ID should be a valid string.')
      .nonempty('GITHUB_CLIENT_ID should not be empty.')
      .trim()
      .default('example123456789')
      .meta({
        description:
          'OAuth application name to verify with the GitHub provider, defaults to example123456789.'
      }),
    UPLOAD_DIR: z
      .string('UPLOAD_DIR should be a valid string.')
      .nonempty('UPLOAD_DIR should not be empty.')
      .trim()
      .default('public')
      .meta({
        description:
          'Directory to which all images, files, documents etc. should be uploaded, defaults to public.'
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
    BETTER_AUTH_URL: z
      .url('BETTER_AUTH_URL should be valid url.')
      .nonempty('BETTER_AUTH_URL should not be empty.')
      .trim()
      .default('http://localhost:3000/api')
      .meta({
        description:
          'Server url of better-auth, defaults to http://localhost:3000/api.'
      }),
    BETTER_AUTH_APPLICATION_NAME: z
      .string('BETTER_AUTH_APPLICATION_NAME should be a valid string.')
      .nonempty('BETTER_AUTH_APPLICATION_NAME should not be empty.')
      .trim()
      .default('healthify')
      .meta({ description: 'Name of the application, defaults to healthify.' }),
    BETTER_AUTH_SESSION_EXPIRES_IN: z.coerce
      .number(
        'BETTER_AUTH_SESSION_EXPIRES_IN should be a valid number in seconds.'
      )
      .default(60 * 60)
      .meta({
        description:
          'Time remaining until automatic logout (seconds), defaults to 1 hour.'
      }),
    BASE_URL: z
      .url('BASE_URL should be valid url.')
      .nonempty('BASE_URL should not be empty.')
      .trim()
      .default('http://localhost:3000/api')
      .meta({
        description: 'Base server url, defaults to http://localhost:3000/api.'
      }),
    CONFIRM_CANCEL_OFFSET: z.coerce
      .number('CONFIRM_CANCEL_OFFSET should be a valid number in hours.')
      .default(5)
      .meta({
        description:
          'Time until the appointment can be canelled/confirmed (hours), defaults to 5 hours.'
      }),
    BETTER_AUTH_MAX_PASSWORD_LENGTH: z.coerce
      .number('BETTER_AUTH_MAX_PASSWORD_LENGTH should be a valid number.')
      .default(256)
      .meta({
        description:
          'Maximum number of characters a password can be, defaults to 256.'
      }),
    BETTER_AUTH_MIN_PASSWORD_LENGTH: z.coerce
      .number('BETTER_AUTH_MIN_PASSWORD_LENGTH should be a valid number.')
      .default(8)
      .meta({
        description:
          'Minimum number of characters a password should be, defaults to 8.'
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
    UPDATE_OFFSET: z.coerce
      .number('UPDATE_OFFSET should be a valid number in days.')
      .default(5)
      .meta({
        description:
          'Days uptil the appointment can be updated, defaults to 5 days.'
      }),
    MAX_PAGE_SIZE: z.coerce
      .number('MAX_PAGE_SIZE should be a valid number.')
      .default(100)
      .meta({
        description:
          'Maximum number of records per page, defaults to 100 records.'
      }),
    DEFAULT_PAGE_NUMBER: z.coerce
      .number('DEFAULT_PAGE_NUMBER should be a valid number.')
      .default(1)
      .meta({
        description: 'Default page to start with, defaults to first page.'
      }),
    DEFAULT_PAGE_SIZE: z.coerce
      .number('DEFAULT_PAGE_SIZE should be a valid number.')
      .default(10)
      .meta({
        description: 'Number of records per page, defaults to 10 records.'
      }),
    PORT: z.coerce
      .number('PORT should be valid number.')
      .default(3000)
      .meta({
        description:
          'Port at which the elysia server is running, defaults to 3000.'
      })
  },
  'envSchema should be a valid object.'
);

export const env = envSchema.parse(process.env);
