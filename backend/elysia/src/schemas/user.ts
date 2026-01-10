import z from 'zod';

export const userSchema = z.object({
  password: z
    .string('Password should be valid.')
    .nonempty('Password is required.')
    .min(8, 'Password must be at least 8 characters long.')
    .max(256, 'Password must be at most 256 characters long.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character.'
    )
    .trim(),
  name: z
    .string('Name should be valid.')
    .nonempty('Name is required.')
    .trim()
    .toLowerCase(),
  email: z.email('Email should be valid.').trim().toLowerCase(),
  verifiedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  id: z.string()
});

export const userPayloadSchema = userSchema.pick({
  password: true,
  email: true,
  name: true
});

export const userResponseSchema = userSchema.omit({ password: true });
export const usersResponseSchema = z.array(userResponseSchema);
