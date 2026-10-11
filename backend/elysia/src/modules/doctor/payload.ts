import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { toFactoryResults, toQuery, clean } from '@/lib/util';
import { model } from '@/modules/doctor/model';
import { schema } from '@/lib/util/schema';

function update() {
  return z
    .object({
      schedule: z
        .array(
          model.schedule.omit({
            createdAt: true,
            updatedAt: true,
            doctorId: true
          }),
          'schedule should be a valid arary.'
        )
        .min(1, 'Atleast 1 schedule should be present.'),
      specializations: z
        .array(
          schema.string('specialization'),
          'specializations should be a valid array.'
        )
        .min(1, 'Atleast 1 specialization should be present.'),
      doctor: model.doctor.partial()
    })
    .partial()
    .transform(clean);
}

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
    .extend({
      experienceYears: model.doctor.shape.experienceYears.unwrap(),
      consultationFee: model.doctor.shape.consultationFee.unwrap(),
      rating: model.doctor.shape.rating.unwrap()
    })
    .partial()
    .transform(toQuery);
}

function userId() {
  return model.doctor.pick({ userId: true });
}

function paginate() {
  return schema.pagination(model.doctor);
}

function read() {
  return model.doctor;
}

export const payload = toFactoryResults({
  paginate,
  update,
  create,
  userId,
  where,
  read
});

export type Payload = ModelType<typeof payload>;
