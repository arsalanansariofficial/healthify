import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { type SchemaSelect, Priority, Status } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const appointment = z.toZod<SchemaSelect['appointment']>()(
  z.object(
    {
      rating: z.coerce.number('rating should be valid number.').nullable(),
      status: z.enum(Status, `Status should be ${Object.values(Status)}.`),
      queue: z.coerce.number('queue should be valid number.'),
      prescription: schema.string('prescription').nullable(),
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

const paginatedAppointments = schema.pagination(appointment);

export const model = { paginatedAppointments, appointment } as const;
