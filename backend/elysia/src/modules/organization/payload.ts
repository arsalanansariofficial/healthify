import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/organization/model';
import { toFactoryResults, join } from '@/lib/util';
import { Roles } from '@/lib/auth/permissions';
import { schema } from '@/lib/util/schema';

function addMember() {
  return z.object(
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
}

function invitationAndMember() {
  return z.object(
    { invitation: model.invitation, member: model.member },
    'invitationAndMember should be a valid object.'
  );
}

function invitationId() {
  return z.object(
    { invitationId: model.invitation.shape.id },
    'invitationId should be a valid object.'
  );
}

export const payload = toFactoryResults({
  invitationAndMember,
  invitationId,
  addMember
});

export type Payload = ModelType<typeof payload>;
