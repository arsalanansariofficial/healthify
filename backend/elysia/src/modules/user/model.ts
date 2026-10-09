import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model as sm } from '@/modules/specialization/model';
import { type SchemaSelect, Gender } from '@/lib/db/schema';
import { model as dm } from '@/modules/doctor/model';
import { toFactoryResults } from '@/lib/util';
import { schema } from '@/lib/util/schema';

function $user() {
  return z.toZod<SchemaSelect['user']>()(
    z.object(
      {
        phoneNumberVerified: z
          .boolean('phoneNumberVerified should be a valid boolean.')
          .nullable(),
        twoFactorEnabled: z
          .boolean('twoFactorEnabled should be a valid boolean.')
          .nullable(),
        isAnonymous: z
          .boolean('isAnonymous should be a valid boolean.')
          .nullable(),
        emailVerified: z.boolean('emailVerified should be a valid boolean.'),
        banned: z.boolean('banned should be a valid boolean.').nullable(),
        displayUsername: schema.string('displayUsername').nullable(),
        phoneNumber: schema.string('phoneNumber').nullable(),
        banExpires: schema.date('banExpires').nullable(),
        banReason: schema.string('banReason').nullable(),
        username: schema.string('username').nullable(),
        role: schema.string('role').nullable(),
        image: schema.url('image').nullable(),
        name: schema.string('name').trim(),
        email: schema.email(),
        id: schema.uuid('id'),
        ...schema.timestamps().shape
      },
      'user should be a valid object.'
    )
  );
}

function userProfile() {
  return z.toZod<SchemaSelect['userProfile']>()(
    z.object(
      {
        gender: z
          .enum(Gender, `gender should be ${Object.values(Gender)}.`)
          .nullable(),
        phoneNumber: schema.string('phoneNumber').nullable(),
        address: schema.string('address').nullable(),
        cover: schema.url('cover').nullable(),
        bio: schema.string('bio').nullable(),
        userId: schema.uuid('userId'),
        ...schema.timestamps().shape
      },
      'userProfile should be a valid object'
    )
  );
}

function user() {
  return $user().extend({
    doctor: dm.doctor
      .extend({
        specializations: z
          .array(sm.specialization, 'specializations should be a valid array.')
          .nullish(),
        schedule: z
          .array(dm.schedule, 'schedule should be a valid array.')
          .nullish()
      })
      .nullish(),
    profile: userProfile().nullish()
  });
}

export const model = toFactoryResults({ userProfile, $user, user });
export type Model = ModelType<typeof model>;
