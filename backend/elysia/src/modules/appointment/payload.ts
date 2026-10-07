import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { toFactoryResults, toQuery, clean } from '@/lib/util';
import { model } from '@/modules/appointment/model';
import { type SchemaInsert } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

function create() {
  return z.toZod<SchemaInsert['appointment']>()(
    model
      .appointment()
      .partial()
      .required({
        patientId: true,
        doctorId: true,
        queue: true,
        date: true,
        from: true,
        to: true
      })
  );
}

function rate() {
  return model
    .appointment()
    .extend({ rating: model.appointment().shape.rating.unwrap() })
    .pick({ rating: true });
}

function changeQueue() {
  return model.appointment().pick({ queue: true, id: true });
}

function where() {
  return model.appointment().partial().transform(toQuery);
}

function update() {
  return model.appointment().partial().transform(clean);
}

function paginated() {
  return schema.pagination(model.appointment());
}

function id() {
  return model.appointment().pick({ id: true });
}

function read() {
  return model.appointment();
}

export const payload = toFactoryResults({
  changeQueue,
  paginated,
  create,
  update,
  where,
  rate,
  read,
  id
});

export type Payload = ModelType<typeof payload>;
