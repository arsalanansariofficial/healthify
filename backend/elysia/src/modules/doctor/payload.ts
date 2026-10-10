import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model as specializationModel } from '@/modules/specialization/model';
import { model as userModel } from '@/modules/user/model';
import { toFactoryResults, toQuery } from '@/lib/util';
import { model } from '@/modules/doctor/model';
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

function paginate() {
  return schema.pagination(
    model.doctor.extend({
      specializations: specializationModel.specialization.array().nullish(),
      schedule: model.schedule.array().nullish(),
      profile: userModel.userProfile.nullish(),
      user: userModel.user.nullish()
    })
  );
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

function read() {
  return model.doctor;
}

export const payload = toFactoryResults({ paginate, create, where, read });
export type Payload = ModelType<typeof payload>;
