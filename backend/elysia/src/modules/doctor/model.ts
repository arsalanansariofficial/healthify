import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const doctor = z.toZod<SchemaSelect['doctor']>()(
  z.object(
    {
      ...schema.timestamps().shape,
      experienceYears: z.coerce
        .number('experienceYears should be a valid number.')
        .default(0),
      consultationFee: z.coerce
        .number('consultationFee should be a valid number.')
        .default(0),
      licenseNumber: schema.string('licenseNumber'),
      userId: schema.uuid('userId')
    },
    'doctor should be valid object.'
  )
);

export const model = { doctor } as const;
