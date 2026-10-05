import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect, Day } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const doctor = z.toZod<SchemaSelect['doctor']>()(
  z.object(
    {
      experienceYears: z.coerce
        .number('experienceYears should be a valid number.')
        .default(0),
      consultationFee: z.coerce
        .number('consultationFee should be a valid number.')
        .default(0),
      rating: z.coerce.number('rating should be a valid number.').default(0),
      licenseNumber: schema.string('licenseNumber'),
      userId: schema.uuid('userId'),
      ...schema.timestamps().shape
    },
    'doctor should be valid object.'
  )
);

const schedule = z.toZod<SchemaSelect['schedule']>()(
  z.object(
    {
      day: z.enum(Day, `day should be ${Object.values(Day)}.`),
      doctorId: schema.uuid('doctorId'),
      from: schema.time('from'),
      to: schema.time('to'),
      ...schema.timestamps().shape
    },
    'schedule should be valid object.'
  )
);

const paginatedDoctors = schema.pagination(doctor);

export const model = { paginatedDoctors, schedule, doctor } as const;
