import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/user/model';
import { schema } from '@/lib/util/schema';
import { env } from '@/lib/config';

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
      .min(
        env.BETTER_AUTH_MIN_PASSWORD_LENGTH,
        `newPassword should be at least ${env.BETTER_AUTH_MIN_PASSWORD_LENGTH} characters.`
      )
      .max(
        env.BETTER_AUTH_MAX_PASSWORD_LENGTH,
        `newPassword should be atmost ${env.BETTER_AUTH_MAX_PASSWORD_LENGTH} characters.`
      )
      .nonempty('newPassword should not be empty.')
      .trim()
  },
  'setPassword should be a valid object.'
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

const userProfile = model.userProfile
  .extend({
    image: schema.fileOrUrl('image').nullable(),
    cover: schema.fileOrUrl('cover').nullable()
  })
  .partial();

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
