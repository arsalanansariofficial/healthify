import '@/lib/config/zod';

import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Gender } from '~/generated/prisma/enums';
import { file } from '@/lib/util';

export type Model = ModelType<typeof model>;

const userProfile = z
  .object(
    {
      phoneNumber: z
        .string({ error: 'Phone number should be valid.' })
        .trim()
        .nullable(),
      gender: z.enum(Gender, { error: 'Gender should be valid.' }).nullable(),
      address: z.string({ error: 'Address should be valid.' }).nullable(),
      userId: z.string({ error: 'UserId should be valid.' }).trim(),
      bio: z.string({ error: 'Bio should be valid.' }).nullable(),
      createdAt: z.date({ error: 'CreatedAt should be valid.' }),
      updatedAt: z.date({ error: 'UpdatedAt should be valid.' }),
      imageUrl: file.nullable(),
      coverUrl: file.nullable()
    },
    { error: 'UserProfile should be a valid object.' }
  )
  .partial();

const user = z
  .object(
    {
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
        .trim()
        .nullish(),
      name: z
        .string('Name should be valid.')
        .nonempty('Name is required.')
        .trim()
        .toLowerCase(),
      emailVerified: z
        .boolean({ error: 'EmailVerified should be a boolean.' })
        .default(false),
      email: z.email('Email should be valid.').trim().toLowerCase(),
      createdAt: z.date({ error: 'CreatedAt should be valid.' }),
      updatedAt: z.date({ error: 'UpdatedAt should be valid.' }),
      id: z.string({ error: 'Id should be valid.' }).trim(),
      profile: userProfile.nullish(),
      image: file.nullish()
    },
    { error: 'User should be a valid object.' }
  )
  .partial();

export const model = {
  payload: user.omit({ profile: true }).extend(userProfile.shape),
  user
} as const;
