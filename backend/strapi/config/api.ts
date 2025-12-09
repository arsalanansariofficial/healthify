import type { Core } from '@strapi/strapi';

const config: Core.Config.Api = {
  rest: {
    strictParams: true,
    defaultLimit: 25,
    withCount: true,
    maxLimit: 100
  },
  documents: { strictParams: true }
};

export default config;
