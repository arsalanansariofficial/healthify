import z from 'zod';

import { Gender } from '~/generated/prisma/enums';

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

const userProfile = z.object({
  phoneNumber: z.string().nullable(),
  imageUrl: z.string().nullable(),
  coverUrl: z.string().nullable(),
  address: z.string().nullable(),
  bio: z.string().nullable(),
  gender: z.enum(Gender),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string()
});

const file = z
  .union([
    z.string('File should be valid.').trim().toLowerCase(),
    z
      .file('File should be valid.')
      .min(10000, 'File should be atleast 10 bytes.')
      .max(1000000, 'File shold be atmost 1 Megabyte.')
      .mime(['image/png'], 'File should be in ".png" format.')
  ])
  .transform(val => val || undefined);

const token = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  token: z.string()
});

const userResponse = user.omit({ password: true });
const userRequest = user.pick({ password: true, email: true, name: true });

const userProfileRequest = userRequest
  .extend(
    userProfile.extend({ coverUrl: file.optional(), imageUrl: file.optional() })
      .shape
  )
  .extend({
    password: user.shape.password.optional().transform(val => val || undefined)
  })
  .omit({ createdAt: true, updatedAt: true, userId: true });

const userProfileResponse = userResponse.extend({
  tokens: z.array(token).optional(),
  profile: userProfile.nullable()
});

const logoutResponse = z.object({
  message: z.string({ error: 'Message should be valid.' }),
  success: z.boolean().default(true)
});

const loginRequest = userRequest
  .extend({ password: z.string({ error: 'Password should be valid.' }) })
  .omit({ name: true });

const jwt = z.object({
  jwt: z.jwt({ error: 'JWT should be valid.' }).optional()
});

const loginResponse = user.omit({ password: true });
const usersResponse = z.array(userResponse);

export const model = {
  userProfileResponse,
  userProfileRequest,
  logoutResponse,
  usersResponse,
  loginResponse,
  loginRequest,
  userResponse,
  userRequest,
  jwt
} as const;

export type Model = { [k in keyof typeof model]: z.infer<(typeof model)[k]> };
