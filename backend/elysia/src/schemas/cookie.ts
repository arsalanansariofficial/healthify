import z from 'zod';

export const jwtSchema = z
  .object({ jwt: z.jwt({ error: 'JWT should be valid.' }).optional() })
  .optional();
