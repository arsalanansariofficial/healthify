import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model as doctorModel } from '@/modules/doctor/model';
import { type SchemaSelect, Gender } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const user = z.toZod<
  {
    profile?: SchemaSelect['userProfile'] | null;
    doctor?: SchemaSelect['doctor'] | null;
  } & SchemaSelect['user']
>()(
  z.object(
    {
      profile: z
        .object(
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
        .nullish(),
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
      doctor: doctorModel.doctor.nullish(),
      name: schema.string('name').trim(),
      ...schema.timestamps().shape,
      email: schema.email(),
      id: schema.uuid('id')
    },
    'user should be a valid object.'
  )
);

export const model = { user } as const;
