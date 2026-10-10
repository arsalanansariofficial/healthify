import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect, Priority, Status } from '@/lib/db/schema';
import { toFactoryResults } from '@/lib/util';
import { schema } from '@/lib/util/schema';

function $appointment() {
  return z.toZod<SchemaSelect['appointment']>()(
    z.object(
      {
        rating: z.coerce
          .number('rating should be valid number.')
          .min(1, 'rating should be minimum of 1.')
          .max(5, 'rating should be maximum of 5.')
          .nullable(),
        queue: z.coerce
          .number('queue should be valid number.')
          .positive('queue should be positive.'),
        status: z.enum(Status, `Status should be ${Object.values(Status)}.`),
        prescription: schema.string('prescription').nullable(),
        feedback: schema.string('feedback').nullable(),
        notes: schema.string('notes').nullable(),
        patientId: schema.uuid('patientId'),
        doctorId: schema.uuid('doctorId'),
        priority: z.enum(Priority),
        from: schema.time('from'),
        date: schema.date('date'),
        to: schema.time('to'),
        id: schema.uuid('id'),
        ...schema.timestamps().shape
      },
      'appointment should be valid object.'
    )
  );
}

function appointment() {
  return $appointment().extend({
    patient: z.any().nullish(),
    doctor: z.any().nullish()
  });
}

export const model = toFactoryResults({ appointment });
export type Model = ModelType<typeof model>;
