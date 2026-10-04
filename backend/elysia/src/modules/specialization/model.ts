import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const specialization = z.toZod<SchemaSelect['specialization']>()(
  z.object(
    { ...schema.timestamps().shape, name: schema.string('name') },
    'specialization should be valid object.'
  )
);

const paginatedSpecialization = schema.pagination(specialization);

export const model = { paginatedSpecialization, specialization } as const;
