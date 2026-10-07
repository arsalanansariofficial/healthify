import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect } from '@/lib/db/schema';
import { toFactoryResults } from '@/lib/util';
import { schema } from '@/lib/util/schema';

function specialization() {
  return z.toZod<SchemaSelect['specialization']>()(
    z.object(
      { ...schema.timestamps().shape, name: schema.string('name') },
      'specialization should be valid object.'
    )
  );
}

export const model = toFactoryResults({ specialization });
export type Model = ModelType<typeof model>;
