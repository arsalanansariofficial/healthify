import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { toFactoryResults, clean, join } from '@/lib/util';
import { Roles } from '@/lib/auth/permissions';
import { model } from '@/modules/user/model';
import { schema } from '@/lib/util/schema';
import { env } from '@/lib/config';

function setPassword() {
  return z.object(
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
}

function userHasPermission() {
  return z.object(
    {
      permissions: z.record(
        schema.string('key'),
        z.array(
          schema.string('value').optional(),
          'permissions should be a valid array of strings.'
        ),
        'permissions should be a valid object.'
      ),
      role: z
        .enum(Roles, `role should be valid, ex: ${join(Roles)}.`)
        .meta({ type: join(Roles), title: 'role' })
        .optional(),
      userId: model.user.shape.id.optional()
    },
    'userHasPermission should be a valid object.'
  );
}

function update() {
  return z
    .deepPartial(
      model.user.extend({
        profile: model.userProfile
          .extend({ cover: schema.fileOrUrl('cover').nullable() })
          .nullish(),
        image: schema.fileOrUrl('image').nullish()
      })
    )
    .transform(clean);
}

function verifyPassword() {
  return z.object(
    {
      password: z
        .string('password should be valid string.')
        .nonempty('password should not be empty.')
        .trim()
    },
    'password should be valid object.'
  );
}

function viewBackupCodes() {
  return z.object(
    { userId: model.user.shape.id },
    'viewBackupCodes should be a valid object.'
  );
}

function read() {
  return model.user;
}

export const payload = toFactoryResults({
  userHasPermission,
  viewBackupCodes,
  verifyPassword,
  setPassword,
  update,
  read
});

export type Payload = ModelType<typeof payload>;
