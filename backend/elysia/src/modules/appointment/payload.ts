import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/appointment/model';

export type Payload = ModelType<typeof payload>;

const appointment = model.appointment.pick({
  priority: true,
  doctorId: true,
  from: true,
  date: true,
  to: true
});

const query = model.appointment
  .extend({
    pageSize: z.coerce.number('pageSize should be a valid number.'),
    page: z.coerce.number('page should be a valid number.')
  })
  .omit({ patientId: true, doctorId: true })
  .partial();

const params = model.appointment.pick({ id: true });

export const payload = { appointment, params, query } as const;
