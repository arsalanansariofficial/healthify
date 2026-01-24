import z from 'zod';

const user = z.object({
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

const userRequest = user.pick({ password: true, email: true, name: true });

const loginRequest = userRequest
  .extend({ password: z.string({ error: 'Password should be valid.' }) })
  .omit({ name: true });

const logoutResponse = z.object({
  message: z.string({ error: 'Message should be valid.' }),
  success: z.boolean().default(true)
});

const jwt = z
  .object({ jwt: z.jwt({ error: 'JWT should be valid.' }).optional() })
  .optional();

const userResponse = user.omit({ password: true });
const loginResponse = user.omit({ password: true });
const usersResponse = z.array(userResponse);

export const model = {
  logoutResponse,
  usersResponse,
  loginResponse,
  loginRequest,
  userResponse,
  userRequest,
  jwt
} as const;

export type Model = { [k in keyof typeof model]: z.infer<(typeof model)[k]> };
