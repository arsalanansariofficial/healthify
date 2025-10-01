import { env } from '@/lib/utils';

export const SOCIAL = {
  EMAIL: env(
    'EMAIL',
    'mailto:theansaricompany@gmail.com?subject=Mail%20To%20Arsalan%20Ansari'
  ),
  GITHUB: env(
    'GITHUB',
    'https://github.com/arsalanansariofficial/arsalanansariofficial'
  ),
  LINKEDIN: env(
    'LINKEDIN',
    'https://www.linkedin.com/in/arsalanansariofficial'
  ),
  WEBSITE: env(
    'WEBSITE',
    'https://arsalanansariofficial.github.io/arsalanansariofficial'
  ),
  WHATSAPP: env('WHATSAPP', 'https://wa.link/dnq2t8')
} as const;
