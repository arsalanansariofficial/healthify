import z from 'zod';

export const successResponseSchema = z.object({
  message: z.string({ error: 'Message should be valid.' }),
  success: z.boolean().default(true)
});
