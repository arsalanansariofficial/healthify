import { type UserConfig, mergeConfig } from 'vite';

export default (config: UserConfig) =>
  mergeConfig(config, { resolve: { alias: { '@': '/src' } } });
