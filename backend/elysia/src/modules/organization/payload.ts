import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/organization/model';
import { Roles } from '@/lib/auth/permissions';
import { schema } from '@/lib/util/schema';
import { join } from '@/lib/util';

export type Payload = ModelType<typeof payload>;

const status = z
  .object(
    {
      backupCodes: z.array(
        z.string('backupCode should be a valid string.'),
        'backupCodes should be a valid array.'
      ),
      success: z.boolean('success should be valid boolean.'),
      status: z.boolean('status should be valid boolean.'),
      error: schema.string('error').nullable()
    },
    'status should be a valid object.'
  )
  .partial();

const addMember = z.object(
  {
    role: schema.typeOrArray(
      z
        .enum(Roles, `role should be valid, ex: ${join(Roles)}.`)
        .meta({ type: join(Roles), title: 'role' })
    ),
    organizationId: schema.uuid('organizationId'),
    userId: schema.uuid('userId')
  },
  'addMember should be a valid object.'
);

const invitationId = z.object(
  { invitationId: model.invitation.shape.id },
  'invitationId should be a valid object.'
);

export const payload = { invitationId, addMember, status } as const;
