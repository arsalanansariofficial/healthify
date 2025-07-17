import z from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email should be valid.' }),
  password: z.string().min(1, { message: 'Password should be valid.' })
});
