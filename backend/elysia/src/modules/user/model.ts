import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect, Gender } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const user = z.toZod<SchemaSelect['User']>()(
  z.object(
    {
      emailVerified: z
        .boolean('emailVerified should be a valid boolean.')
        .default(false)
        .nullable(),
      phoneNumberVerified: z
        .boolean('phoneNumberVerified should be a valid boolean.')
        .nullable(),
      twoFactorEnabled: z
        .boolean('twoFactorEnabled should be a valid boolean.')
        .nullable(),
      isAnonymous: z
        .boolean('isAnonymous should be a valid boolean.')
        .nullable(),
      banned: z.boolean('banned should be a valid boolean.').nullable(),
      displayUsername: schema.string('displayUsername').nullable(),
      phoneNumber: schema.string('phoneNumber').nullable(),
      banExpires: schema.date('banExpires').nullable(),
      banReason: schema.string('banReason').nullable(),
      updatedAt: schema.date('updatedAt').nullable(),
      createdAt: schema.date('createdAt').nullable(),
      username: schema.string('username').nullable(),
      role: schema.string('role').nullable(),
      image: schema.url('image').nullable(),
      name: schema.string('name').trim(),
      email: schema.email(),
      id: schema.uuid('id')
    },
    'user should be a valid object.'
  )
);

const userProfile = z.toZod<SchemaSelect['UserProfile']>()(
  z.object(
    {
      gender: z.enum(Gender, `gender should be ${Gender}.`).nullable(),
      phoneNumber: schema.string('phoneNumber').nullable(),
      updatedAt: schema.date('updatedAt').nullable(),
      createdAt: schema.date('createdAt').nullable(),
      address: schema.string('address').nullable(),
      cover: schema.url('cover').nullable(),
      bio: schema.string('bio').nullable(),
      userId: schema.uuid('userId')
    },
    'userProfile should be a valid object'
  )
);

const userWithProfile = z.toZod<
  { profile: SchemaSelect['UserProfile'] | null } & SchemaSelect['User']
>()(user.extend({ profile: userProfile.nullable() }));

export const model = { userWithProfile, userProfile, user } as const;
