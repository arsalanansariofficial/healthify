import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/specialization/model';
import { schema } from '@/lib/util/schema';

export type Payload = ModelType<typeof payload>;

const query = z
  .object(
    {
      pageSize: z.coerce.number('pageSize should be a valid number.'),
      page: z.coerce.number('page should be a valid number.'),
      name: schema.string('name')
    },
    'params should be a valid object.'
  )
  .partial();

const specialization = model.specialization.partial().required({ name: true });
const params = z.object({ name: schema.string('name') });

export const payload = { specialization, params, query } as const;
