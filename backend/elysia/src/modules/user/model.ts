import z from 'zod';

import type { UserProfile, Prisma, User } from '~/generated/prisma/client';
import type { ModelType } from '@/lib/util/types';

import { Gender } from '~/generated/prisma/enums';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const user = z.toZod<User>()(
  z.object(
    {
      displayUsername: z
        .string('displayUsername should be a valid string.')
        .nonempty('displayUsername should not be empty.')
        .toLowerCase()
        .trim()
        .nullable(),
      phoneNumber: z
        .string('phoneNumber should be a valid string.')
        .nonempty('phoneNumber should not be empty.')
        .toLowerCase()
        .trim()
        .nullable(),
      username: z
        .string('username should be a valid string.')
        .nonempty('username should not be empty.')
        .toLowerCase()
        .trim()
        .nullable(),
      name: z
        .string('name should be valid string.')
        .nonempty('name should not be empty.')
        .toLowerCase()
        .trim(),
      image: z
        .url('image should be a valid url.')
        .nonempty('image should not be empty.')
        .trim()
        .nullable(),
      twoFactorEnabled: z
        .boolean('twoFactorEnabled should be a valid boolean.')
        .default(false)
        .nullable(),
      email: z
        .email('email should be a valid.')
        .nonempty('email should not be empty.')
        .trim(),
      phoneNumberVerified: z
        .boolean('phoneNumberVerified should be a valid boolean.')
        .nullable(),
      emailVerified: z
        .boolean('emailVerified should be a valid boolean.')
        .default(false),
      isAnonymous: z
        .boolean('isAnonymous should be a valid boolean.')
        .nullable(),
      id: schema.uuid('id').nonempty('id should not be empty.').trim(),
      createdAt: schema.date('createdAt'),
      updatedAt: schema.date('updatedAt')
    },
    'user should be a valid object.'
  )
);

const userProfile = z.toZod<UserProfile>()(
  z.object(
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
      cover: z
        .url('cover should be a valid url.')
        .nonempty('cover should not be empty.')
        .toLowerCase()
        .trim()
        .nullable(),
      bio: z
        .string('bio should be a valid string.')
        .nonempty('bio should not be empty.')
        .toLowerCase()
        .trim()
        .nullable(),
      gender: z.enum(Gender, `gender should be ${Gender}.`).nullable(),
      updatedAt: schema.date('updatedAt'),
      createdAt: schema.date('createdAt'),
      userId: schema.uuid('userId')
    },
    'userProfile should be a valid object'
  )
);

const userWithProfile = z.toZod<
  Prisma.UserGetPayload<{ include: { profile: true } }>
>()(user.extend({ profile: userProfile.nullable() }));

export const model = { userWithProfile, userProfile, user } as const;
