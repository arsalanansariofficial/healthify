import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Gender } from '~/generated/prisma/enums';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const userProfile = z.object(
  {
    phoneNumber: z
      .string('phoneNumber should be a valid string.')
      .nonempty('phoneNumber should not be empty.')
      .toLowerCase()
      .trim()
      .nullable(),
    address: z
      .string('address should be a valid string.')
      .nonempty('address should not be empty.')
      .toLowerCase()
      .trim()
      .nullable(),
    bio: z
      .string('bio should be a valid string.')
      .nonempty('bio should not be empty.')
      .toLowerCase()
      .trim()
      .nullable(),
    image: z
      .url('image should be a valid url.')
      .nonempty('image should not be empty.')
      .trim()
      .nullable(),
    cover: z
      .url('cover should be a valid url.')
      .nonempty('cover should not be empty.')
      .trim()
      .nullable(),
    gender: z
      .enum(Gender, `gender should be valid, ex: ${Object.values(Gender)}.`)
      .nullable(),
    userId: schema
      .uuid('userId')
      .nonempty('userId should not be empty.')
      .trim(),
    createdAt: schema.date('createdAt'),
    updatedAt: schema.date('updatedAt')
  },
  'userProfile should be a valid object.'
);

const user = z.object(
  {
    name: z
      .string('name should be valid string.')
      .nonempty('name should not be empty.')
      .toLowerCase()
      .trim(),
    email: z
      .email('email should be a valid.')
      .nonempty('email should not be empty.')
      .trim(),
    emailVerified: z
      .boolean('emailVerified should be a valid boolean.')
      .default(false),
    id: schema.uuid('id').nonempty('id should not be empty.').trim(),
    image: z.url('image should be a valid url.').trim().nullable(),
    createdAt: schema.date('createdAt'),
    updatedAt: schema.date('updatedAt')
  },
  'user should be a valid object.'
);

const userWithProfile = z.object(
  { ...user.shape, profile: userProfile.nullable() },
  'userWithProfile should be valid object.'
);

export const model = { userWithProfile, userProfile, user } as const;
