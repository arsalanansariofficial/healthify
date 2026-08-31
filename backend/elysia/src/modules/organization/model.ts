import z from 'zod';

import type { SchemaSelect } from '@/lib/db/schema';
import type { ModelType } from '@/lib/util/types';

import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const organization = z.toZod<SchemaSelect['Organization']>()(
  z.object(
    {
      updatedAt: schema.date('updatedAt').nullable(),
      createdAt: schema.date('createdAt').nullable(),
      metadata: schema.url('metadata').nullable(),
      logo: schema.url('logo').nullable(),
      name: schema.string('name').trim(),
      slug: schema.string('slug'),
      id: schema.uuid('id')
    },
    'organization should be a valid object.'
  )
);

const member = z.toZod<SchemaSelect['Member']>()(
  z.object(
    {
      organizationId: schema.string('organizationId'),
      updatedAt: schema.date('updatedAt').nullable(),
      createdAt: schema.date('createdAt').nullable(),
      userId: schema.string('userId'),
      role: schema.string('role'),
      id: schema.uuid('id')
    },
    'member should be a valid object'
  )
);

const invitation = z.toZod<SchemaSelect['Invitation']>()(
  z.object(
    {
      organizationId: schema.string('organizationId'),
      expiresAt: schema.date('expiresAt').nullable(),
      updatedAt: schema.date('updatedAt').nullable(),
      createdAt: schema.date('createdAt').nullable(),
      teamId: schema.string('teamId').nullable(),
      role: schema.string('role').nullable(),
      inviterId: schema.string('inviterId'),
      status: schema.string('status'),
      email: schema.email(),
      id: schema.uuid('id')
    },
    'invitation should be a valid object'
  )
);

const invitationAndMember = z.toZod<{
  invitation: SchemaSelect['Invitation'];
  member: SchemaSelect['Member'];
}>()(
  z.object(
    { invitation, member },
    'invitationAndMember should be a valid object.'
  )
);

export const model = {
  invitationAndMember,
  organization,
  invitation,
  member
} as const;
