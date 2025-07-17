import z from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email should be valid.' }),
  password: z.string().min(1, { message: 'Password should be valid.' })
});

export const signupSchema = z.object({
  email: z.string().email({ message: 'Email should be valid.' }),
  password: z.string().min(1, { message: 'Password should be valid.' }),
  name: z.string().min(3, { message: 'Should be atleast 3 characters.' })
});

export const userSchema = z.object({
  emailVerified: z.enum(['yes', 'no']).optional(),
  email: z.string().email({ message: 'Email should be valid.' }).optional(),
  password: z
    .string()
    .min(1, { message: 'Password should be valid.' })
    .optional(),
  name: z
    .string()
    .min(3, { message: 'Should be atleast 3 characters.' })
    .optional()
});
