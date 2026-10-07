import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { doctor, model } from '@/modules/doctor/model';
import { toFactoryResults, toQuery } from '@/lib/util';
import { schema } from '@/lib/util/schema';

function create() {
  return z.object({
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
}

function where() {
  return model.doctor
    .extend(schema.pageQuery().shape)
    .partial()
    .transform(toQuery);
}

function paginate() {
  return schema.pagination(doctor());
}

function read() {
  return model.doctor;
}

export const payload = toFactoryResults({ paginate, create, where, read });
export type Payload = ModelType<typeof payload>;
