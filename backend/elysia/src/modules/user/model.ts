import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Gender } from '~/generated/prisma/enums';
import { file } from '@/lib/util';

export type Model = ModelType<typeof model>;

const userProfile = z.object({
  phoneNumber: z.string().nonempty().trim().toLowerCase().nullable(),
  address: z.string().nonempty().trim().toLowerCase().nullable(),
  bio: z.string().nonempty().trim().toLowerCase().nullable(),
  userId: z.string().nonempty().trim(),
  gender: z.enum(Gender).nullable(),
  image: file.nullable(),
  cover: file.nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const user = z.object({
  name: z.string().nonempty().trim().toLowerCase(),
  emailVerified: z.boolean().default(false),
  email: z.email().trim().toLowerCase(),
  id: z.string().nonempty().trim(),
  image: file.nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const userWithProfile = z.object({
  ...user.shape,
  profile: userProfile.nullable()
});

const payload = z.object({
  phoneNumber: userProfile.shape.phoneNumber.nullish(),
  password: z.string().nonempty().trim().nullish(),
  address: userProfile.shape.address.nullish(),
  gender: userProfile.shape.gender.nullish(),
  image: userProfile.shape.image.nullish(),
  cover: userProfile.shape.cover.nullish(),
  bio: userProfile.shape.bio.nullish(),
  status: z.boolean().nullish()
});

export const model = { userWithProfile, userProfile, payload, user };
