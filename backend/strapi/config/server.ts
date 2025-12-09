import type { Core } from '@strapi/strapi';

export default function config({
  env
}: Core.Config.Shared.ConfigParams): Core.Config.Server {
  return {
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false)
    },
    app: { keys: env.array('APP_KEYS')! },
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337)
  };
}
