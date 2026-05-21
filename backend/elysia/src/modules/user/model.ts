import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Gender } from '~/generated/prisma/enums';
import { file } from '@/lib/util';

export type Model = ModelType<typeof model>;

const user = z.object({
  emailVerified: z.boolean().default(false),
  name: z.string().trim().toLowerCase(),
  email: z.email().trim().toLowerCase(),
  id: z.string().trim(),
  image: file.nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const userProfile = z.object({
  phoneNumber: z.string().trim().toLowerCase().nullable(),
  address: z.string().trim().toLowerCase().nullable(),
  bio: z.string().trim().toLowerCase().nullable(),
  gender: z.enum(Gender).nullable(),
  userId: z.string().trim(),
  image: file.nullable(),
  cover: file.nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const payload = z.object({
  phoneNumber: userProfile.shape.phoneNumber.nullish(),
  address: userProfile.shape.address.nullish(),
  gender: userProfile.shape.gender.nullish(),
  image: userProfile.shape.image.nullish(),
  cover: userProfile.shape.cover.nullish(),
  bio: userProfile.shape.bio.nullish()
});

const userWithProfile = z.object({
  ...user.shape,
  profile: userProfile.nullable()
});

export const model = { userWithProfile, userProfile, payload, user };
