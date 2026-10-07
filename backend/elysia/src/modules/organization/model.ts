import z from 'zod';

import type { SchemaSelect } from '@/lib/db/schema';
import type { ModelType } from '@/lib/util/types';

import { toFactoryResults } from '@/lib/util';
import { schema } from '@/lib/util/schema';

function invitation() {
  return z.toZod<SchemaSelect['invitation']>()(
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
}

function organization() {
  return z.toZod<SchemaSelect['organization']>()(
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
}

function member() {
  return z.toZod<SchemaSelect['member']>()(
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
}

export const model = toFactoryResults({ organization, invitation, member });

export type Model = ModelType<typeof model>;
