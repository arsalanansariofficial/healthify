import z from 'zod';

import '@/utils/config/zod';
import type { ModelType } from '@/utils/lib';

import { Gender } from '~/generated/prisma/enums';

const file = z.union([
  z.string('File should be valid.').trim().toLowerCase(),
  z
    .file('File should be valid.')
    .min(10000, 'File should be atleast 10 bytes.')
    .max(1000000, 'File shold be atmost 1 Megabyte.')
    .mime(['image/png'], 'File should be in ".png" format.')
]);

const user = z
  .object({
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
    verifiedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    id: z.string()
  })
  .partial();

const userProfile = z
  .object({
    phoneNumber: z.string().nullable(),
    gender: z.enum(Gender).nullable(),
    address: z.string().nullable(),
    bio: z.string().nullable(),
    imageUrl: file.nullable(),
    coverUrl: file.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string()
  })
  .partial();

const token = z
  .object({
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string(),
    token: z.string()
  })
  .partial();

const userWithProfileAndToken = user
  .extend({
    tokens: z.array(token).nullable(),
    profile: userProfile.nullable()
  })
  .omit({ password: true })
  .partial();

const userProfilePayload = userWithProfileAndToken
  .extend({ password: user.shape.password, imageUrl: file, coverUrl: file })
  .partial();

const success = z.object({
  message: z.string({ error: 'Message should be valid.' }),
  success: z.boolean().default(true)
});

const jwt = z.object({
  jwt: z.jwt({ error: 'JWT should be valid.' }).optional()
});

export const model = {
  userPayload: user.required({ password: true, email: true, name: true }),
  loginPayload: user.pick({ password: true, email: true }).required(),
  userWithProfileAndToken,
  userProfilePayload,
  success,
  token,
  user,
  jwt
} as const;

export type Model = ModelType<typeof model>;
