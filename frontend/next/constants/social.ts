import { env } from '@/lib/utils';

export const SOCIAL = {
  WHATSAPP: env('WHATSAPP', 'https://wa.link/dnq2t8'),
  LINKEDIN: env(
    'LINKEDIN',
    'https://www.linkedin.com/in/arsalanansariofficial'
  ),
  GITHUB: env(
    'GITHUB',
    'https://github.com/arsalanansariofficial/arsalanansariofficial'
  ),
  WEBSITE: env(
    'WEBSITE',
    'https://arsalanansariofficial.github.io/arsalanansariofficial'
  ),
  EMAIL: env(
    'EMAIL',
    'mailto:theansaricompany@gmail.com?subject=Mail%20To%20Arsalan%20Ansari'
  )
} as const;
