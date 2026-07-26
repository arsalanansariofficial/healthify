import z from 'zod';

import type {
  Organization,
  Invitation,
  Member
} from '~/generated/prisma/client';
import type { ModelType } from '@/lib/util/types';

import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const organization = z.toZod<Organization>()(
  z.object(
    {
      metadata: schema.url('metadata').nullable(),
      logo: schema.url('logo').nullable(),
      updatedAt: schema.date('updatedAt'),
      createdAt: schema.date('createdAt'),
      name: schema.string('name').trim(),
      slug: schema.string('slug'),
      id: schema.uuid('id')
    },
    'organization should be a valid object.'
  )
);

const member = z.toZod<Member>()(
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

const invitation = z.toZod<Invitation>()(
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

const invitationAndMember = z.object(
  { invitation, member },
  'invitationAndMember should be a valid object.'
);

export const model = {
  invitationAndMember,
  organization,
  invitation,
  member
} as const;
