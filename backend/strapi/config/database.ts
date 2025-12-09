import type { Core } from '@strapi/strapi';

import path from 'path';

export default function config({
  env
}: Core.Config.Shared.ConfigParams): Core.Config.Database {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    postgres: {
      connection: {
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          key: env('DATABASE_SSL_KEY', undefined),
          ca: env('DATABASE_SSL_CA', undefined)
        },
        password: env('DATABASE_PASSWORD', 'strapi'),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        schema: env('DATABASE_SCHEMA', 'public'),
        host: env('DATABASE_HOST', 'localhost'),
        connectionString: env('DATABASE_URL'),
        port: env.int('DATABASE_PORT', 5432)
      },
      pool: {
        max: env.int('DATABASE_POOL_MAX', 10),
        min: env.int('DATABASE_POOL_MIN', 2)
      }
    },
    mysql: {
      connection: {
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          key: env('DATABASE_SSL_KEY', undefined),
          ca: env('DATABASE_SSL_CA', undefined)
        },
        password: env('DATABASE_PASSWORD', 'strapi'),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306)
      },
      pool: {
        max: env.int('DATABASE_POOL_MAX', 10),
        min: env.int('DATABASE_POOL_MIN', 2)
      }
    },
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        )
      },
      useNullAsDefault: true
    }
  };

  if (!(client in connections))
    throw new Error(
      `Unsupported DATABASE_CLIENT: ${client}. Use "postgres", "mysql", or "sqlite".`
    );

  type DatabaseClient = keyof typeof connections;

  return {
    connection: {
      client: client as DatabaseClient,
      ...connections[client as DatabaseClient],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000)
    }
  } as Core.Config.Database;
}
