import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect, Day } from '@/lib/db/schema';
import { toFactoryResults } from '@/lib/util';
import { schema } from '@/lib/util/schema';

export function $doctor() {
  return z.toZod<SchemaSelect['doctor']>()(
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
}

function $schedule() {
  return z.toZod<SchemaSelect['schedule']>()(
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
}

function doctor() {
  return $doctor().extend({
    specializations: z.any().nullish(),
    appointments: z.any().nullish(),
    schedule: z.any().nullish(),
    profile: z.any().nullish(),
    user: z.any().nullish()
  });
}

function schedule() {
  return $schedule().extend({ doctor: z.any().nullish() });
}

export const model = toFactoryResults({ schedule, doctor });
export type Model = ModelType<typeof model>;
