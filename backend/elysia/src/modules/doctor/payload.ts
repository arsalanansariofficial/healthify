import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/doctor/model';
import { schema } from '@/lib/util/schema';

export type Payload = ModelType<typeof payload>;

const register = z.object({
  schedule: z.array(
    model.schedule.omit({ createdAt: true, updatedAt: true, doctorId: true }),
    'schedule should be a valid arary.'
  ),
  specializations: z.array(
    schema.string('specialization'),
    'specializations should be a valid array.'
  ),
  doctor: model.doctor.partial().required({ licenseNumber: true })
});

export const payload = { register } as const;
