import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/doctor/model';
import { schema } from '@/lib/util/schema';
import { Day } from '@/lib/db/schema';

export type Payload = ModelType<typeof payload>;

const schedule = z.object(
  {
    day: z.enum(Day, `day should be ${Object.values(Day)}`),
    doctorId: schema.uuid('doctorId'),
    from: schema.string('from'),
    to: schema.string('to'),
    ...schema.timestamps().shape
  },
  'schedule should be a valid object.'
);

const register = z.object({
  schedule: z.array(
    schedule.omit({ createdAt: true, updatedAt: true, doctorId: true }),
    'schedule should be a valid arary.'
  ),
  specializations: z.array(
    schema.string('specialization'),
    'specializations should be a valid array.'
  ),
  doctor: model.doctor.partial().required({ licenseNumber: true })
});

export const payload = { register } as const;
