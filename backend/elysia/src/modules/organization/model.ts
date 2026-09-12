import z from 'zod';

import type { SchemaSelect } from '@/lib/db/schema';
import type { ModelType } from '@/lib/util/types';

import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const organization = z.toZod<SchemaSelect['organization']>()(
  z.object(
    {
      metadata: schema.url('metadata').nullable(),
      updatedAt: schema.date('updatedAt'),
      createdAt: schema.date('createdAt'),
      logo: schema.url('logo').nullable(),
      name: schema.string('name').trim(),
      slug: schema.string('slug'),
      id: schema.uuid('id')
    },
    'organization should be a valid object.'
  )
);

const member = z.toZod<SchemaSelect['member']>()(
  z.object(
    {
      organizationId: schema.string('organizationId'),
      updatedAt: schema.date('updatedAt'),
      createdAt: schema.date('createdAt'),
      userId: schema.string('userId'),
      role: schema.string('role'),
      id: schema.uuid('id')
    },
    'member should be a valid object'
  )
);

const invitation = z.toZod<SchemaSelect['invitation']>()(
  z.object(
    {
      organizationId: schema.string('organizationId'),
      teamId: schema.string('teamId').nullable(),
      role: schema.string('role').nullable(),
      inviterId: schema.string('inviterId'),
      expiresAt: schema.date('expiresAt'),
      updatedAt: schema.date('updatedAt'),
      createdAt: schema.date('createdAt'),
      status: schema.string('status'),
      email: schema.email(),
      id: schema.uuid('id')
    },
    'invitation should be a valid object'
  )
);

const invitationAndMember = z.toZod<{
  invitation: SchemaSelect['invitation'];
  member: SchemaSelect['member'];
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
