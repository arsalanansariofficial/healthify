import z from 'zod';

import type { SchemaInsert } from '@/lib/db/schema';
import type { ModelType } from '@/lib/util/types';

import { model as doctorModel } from '@/modules/doctor/model';
import { toFactoryResults, toQuery, clean } from '@/lib/util';
import { model as userModel } from '@/modules/user/model';
import { model } from '@/modules/specialization/model';
import { schema } from '@/lib/util/schema';

function paginate() {
  return schema.pagination(
    model.specialization.extend({
      doctors: doctorModel.doctor
        .extend({
          schedule: doctorModel.schedule.array().nullish(),
          profile: userModel.userProfile.nullish(),
          user: userModel.user.nullish()
        })
        .array()
        .nullish()
    })
  );
}

function create() {
  return z.toZod<SchemaInsert['specialization']>()(
    model.specialization.partial().required({ name: true })
  );
}

function where() {
  return model.specialization
    .extend(schema.pageQuery().shape)
    .partial()
    .transform(toQuery);
}

function update() {
  return model.specialization.partial().transform(clean);
}

function name() {
  return model.specialization.pick({ name: true });
}

function read() {
  return model.specialization;
}

export const payload = toFactoryResults({
  paginate,
  create,
  update,
  where,
  read,
  name
});

export type Payload = ModelType<typeof payload>;
