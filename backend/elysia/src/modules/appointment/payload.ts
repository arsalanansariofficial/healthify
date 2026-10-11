import { type SQL, sql } from 'drizzle-orm';
import { isValid, format } from 'date-fns';
import z from 'zod';

import type { QueryFilter, ModelType } from '@/lib/util/types';

import { toFactoryResults, toFilter, clean } from '@/lib/util';
import { model } from '@/modules/appointment/model';
import { appointment } from '@/lib/db/schema';
import { schema } from '@/lib/util/schema';

export enum Actions {
  confirm = 'confirm',
  cancel = 'cancel'
}

type Filter = [string, ((t: typeof appointment) => SQL) | QueryFilter];

function where() {
  return model.appointment
    .extend(schema.pageQuery().shape)
    .partial()
    .transform(v =>
      Object.fromEntries(
        Object.entries(v).map(([k, v]): Filter => {
          if (v && v instanceof Date && isValid(v))
            return [
              'RAW',
              t => sql`date(${t.date}) = ${format(v.toString(), 'yyyy-MM-dd')}`
            ];
          return toFilter([k, String(v)]) as Filter;
        })
      )
    );
}

function actions() {
  return model.appointment
    .pick({ id: true })
    .extend({
      action: z.enum(
        ['confirm', 'cancel'],
        `action can be of ${Object.values(Actions)}.`
      )
    });
}

function rate() {
  return z.object(
    {
      feedback: model.appointment.shape.feedback.optional(),
      rating: model.appointment.shape.rating.unwrap()
    },
    'rate should be a valid object.'
  );
}

function prescribe() {
  return model.appointment
    .pick({ prescription: true, notes: true })
    .partial()
    .transform(clean);
}

function create() {
  return model.appointment
    .partial()
    .required({ doctorId: true, date: true, from: true, to: true });
}

function changeQueue() {
  return model.appointment.pick({ queue: true });
}

function paginated() {
  return schema.pagination(model.appointment);
}

function id() {
  return model.appointment.pick({ id: true });
}

function read() {
  return model.appointment;
}

export const payload = toFactoryResults({
  changeQueue,
  paginated,
  prescribe,
  actions,
  create,
  where,
  rate,
  read,
  id
});

export type Payload = ModelType<typeof payload>;
