import type { Core } from '@strapi/strapi';

export default function config({
  env
}: Core.Config.Shared.ConfigParams): Core.Config.Admin {
  return {
    flags: {
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
      nps: env.bool('FLAG_NPS', true)
    },
    transfer: { token: { salt: env('TRANSFER_TOKEN_SALT')! } },
    secrets: { encryptionKey: env('ENCRYPTION_KEY')! },
    auth: { secret: env('ADMIN_JWT_SECRET')! },
    apiToken: { salt: env('API_TOKEN_SALT')! }
  };
}
