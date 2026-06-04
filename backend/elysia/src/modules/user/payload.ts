import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/user/model';

export type Payload = ModelType<typeof payload>;

const setPassword = z.object(
  {
    newPassword: z
      .string('newPassword should be a valid string.')
      .regex(
        /[^A-Za-z0-9]/,
        'newPassword should contain at least one uppercase character, one lowercase character and one number.'
      )
      .regex(
        /[a-z]/,
        'newPassword should contain at least one lowercase character.'
      )
      .regex(
        /[A-Z]/,
        'newPassword should contain at least one uppercase character.'
      )
      .regex(/[0-9]/, 'newPassword should contain at least one number.')
      .max(256, 'newPassword should be atmost 256 characters.')
      .min(8, 'newPassword should be at least 8 characters.')
      .nonempty('newPassword should not be empty.')
      .trim()
  },
  'setPassword should be a valid object.'
);

const userProfile = z.object(
  {
    phoneNumber: model.userProfile.shape.phoneNumber.nullish(),
    address: model.userProfile.shape.address.nullish(),
    gender: model.userProfile.shape.gender.nullish(),
    image: model.userProfile.shape.image.nullish(),
    cover: model.userProfile.shape.cover.nullish(),
    bio: model.userProfile.shape.bio.nullish()
  },
  'userProfile should be valid object.'
);

const verifyPassword = z.object(
  {
    password: z
      .string('password should be valid string.')
      .nonempty('password should not be empty.')
      .trim()
  },
  'password should be valid object.'
);

const status = z.object(
  { status: z.boolean('status should be valid boolean.') },
  'status should be a valid object.'
);

export const payload = {
  verifyPassword,
  setPassword,
  userProfile,
  status
} as const;
