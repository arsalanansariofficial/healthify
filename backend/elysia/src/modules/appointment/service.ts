import { and, avg, sql, gte, lte, eq, lt, gt, ne } from 'drizzle-orm';
import * as fns from 'date-fns';

import type { Payload } from '@/modules/appointment/payload';
import type { Model } from '@/modules/user/model';

import { Status, schema } from '@/lib/db/schema';
import { paginate } from '@/lib/pagination';
import { ApiError } from '@/lib/error';
import { isAllowed } from '@/lib/util';
import { env } from '@/lib/config';
import { db } from '@/lib/db';

async function changeQueue(params: {
  body: Payload['changeQueue'];
  params: Payload['id'];
  user: Model['user'];
}) {
  await isAllowed({
    permissions: { appointment: ['update'] },
    userId: params.user.id
  });

  const { user, body } = params;
  const { id } = params.params;

  return db.transaction(tx => {
    const appointment = tx.query.appointment
      .findFirst({ where: { doctorId: user.id, id } })
      .sync();

    if (!appointment)
      throw new ApiError({
        message: `Appointment with id ${id} does not exist`
      });

    if (appointment.queue === body.queue) return appointment;
    const dateSql = sql`date(${schema.appointment.date}) = ${fns.format(appointment.date, 'yyyy-MM-dd')}`;

    const appointments = tx
      .$count(
        schema.appointment,
        and(
          eq(schema.appointment.doctorId, appointment.doctorId),
          ne(schema.appointment.status, Status.cancelled),
          dateSql
        )
      )
      .sync();

    if (body.queue > appointments)
      throw new ApiError({
        message: `Queue cannot be greater than ${appointments}`
      });

    if (body.queue < appointment.queue)
      tx.update(schema.appointment)
        .set({ queue: sql`${schema.appointment.queue} + 1` })
        .where(
          and(
            eq(schema.appointment.doctorId, appointment.doctorId),
            ne(schema.appointment.status, Status.cancelled),
            lt(schema.appointment.queue, appointment.queue),
            gte(schema.appointment.queue, body.queue),
            dateSql
          )
        )
        .run();

    if (body.queue > appointment.queue)
      tx.update(schema.appointment)
        .set({ queue: sql`${schema.appointment.queue} - 1` })
        .where(
          and(
            eq(schema.appointment.doctorId, appointment.doctorId),
            ne(schema.appointment.status, Status.cancelled),
            gt(schema.appointment.queue, appointment.queue),
            lte(schema.appointment.queue, body.queue),
            dateSql
          )
        )
        .run();

    const updated = tx
      .update(schema.appointment)
      .set({ queue: body.queue })
      .where(eq(schema.appointment.id, id))
      .returning()
      .get();

    if (!updated)
      throw new ApiError({ message: 'Failed to updated appointment.' });

    return updated;
  });
}

async function rate(params: {
  body: Payload['rate'];
  params: Payload['id'];
  user: Model['user'];
}) {
  await isAllowed({
    permissions: { appointment: ['rate'] },
    userId: params.user.id
  });

  const daysAgo = env.UPDATE_OFFSET;
  const { user, body } = params;
  const { id } = params.params;
  const now = new Date();

  const appointment = await db.query.appointment.findFirst({
    where: {
      OR: [{ doctorId: user.id }, { patientId: user.id }],
      date: { gte: fns.subDays(now, daysAgo), lte: now },
      status: Status.confirmed,
      id
    }
  });

  if (!appointment)
    throw new ApiError({
      errors: [
        'Appointment ID is invalid.',
        'Doctor ID or Patiend ID is invalid.',
        `Status is not ${Status.confirmed}.`,
        'Appointment is not yet completed.'
      ],
      message:
        'Failed to rate appointment due to either one of the following reasons.',
      code: 'Bad Request',
      name: 'Bad Request'
    });

  return db.transaction(tx => {
    const updated = tx
      .update(schema.appointment)
      .set(body)
      .where(eq(schema.appointment.id, id))
      .returning()
      .get();

    const rating = Number(
      tx
        .select({ rating: avg(schema.appointment.rating) })
        .from(schema.appointment)
        .where(eq(schema.appointment.doctorId, appointment.doctorId))
        .get()?.rating || 0
    );

    tx.update(schema.doctor)
      .set({ rating })
      .where(eq(schema.doctor.userId, appointment.doctorId))
      .run();

    return updated;
  });
}

async function confirmOrCancel(params: {
  params: Payload['actions'];
  user: Model['user'];
}) {
  await isAllowed({
    permissions: { appointment: [params.params.action] },
    userId: params.user.id
  });

  const participle = { confirm: Status.confirmed, cancel: Status.cancelled };
  const hoursAgo = env.CONFIRM_CANCEL_OFFSET;
  const { action, id } = params.params;
  const { user } = params;
  const now = new Date();

  const isValidAppointment = await db.query.appointment.findFirst({
    where: {
      OR: [{ doctorId: user.id }, { patientId: user.id }],
      date: { gte: fns.addHours(now, hoursAgo) },
      id
    }
  });

  if (!isValidAppointment)
    throw new ApiError({
      errors: [
        'Appointment ID is invalid.',
        'Doctor ID or Patiend ID is invalid.',
        `Appointment can only be ${participle[action]} before ${hoursAgo} hours from the appointment date.`
      ],
      message: `Failed to ${action} appointment due to either one of the following reasons.`,
      code: 'Bad Request',
      name: 'Bad Request'
    });

  return db
    .update(schema.appointment)
    .set({ status: participle[action] })
    .where(eq(schema.appointment.id, id))
    .returning()
    .get();
}

async function prescribe(params: {
  body: Payload['prescribe'];
  params: Payload['id'];
  user: Model['user'];
}) {
  await isAllowed({
    permissions: { appointment: ['update'] },
    userId: params.user.id
  });

  const daysAgo = env.UPDATE_OFFSET;
  const { user, body } = params;
  const { id } = params.params;
  const now = new Date();

  const appointment = await db.query.appointment.findFirst({
    where: {
      OR: [{ doctorId: user.id }, { patientId: user.id }],
      date: { gte: fns.subDays(now, daysAgo), lte: now },
      status: Status.confirmed,
      id
    }
  });

  if (!appointment)
    throw new ApiError({
      errors: [
        'Appointment ID is invalid.',
        'Doctor ID or Patiend ID is invalid.',
        `Status is not ${Status.confirmed}.`,
        'Appointment is not yet completed.'
      ],
      message:
        'Failed to update appointment due to either one of the following reasons.',
      code: 'Bad Request',
      name: 'Bad Request'
    });

  if (body)
    return db
      .update(schema.appointment)
      .set(body)
      .where(eq(schema.appointment.id, params.params.id))
      .returning()
      .get();

  return appointment;
}

async function create(params: {
  body: Payload['create'];
  user: Model['user'];
}) {
  await isAllowed({
    permissions: { appointment: ['create'] },
    userId: params.user.id
  });

  const { user, body } = params;
  body.date = fns.parse(body.from, 'HH:mm', body.date);

  const hoursAgo = env.CONFIRM_CANCEL_OFFSET;
  const now = new Date();

  const isValidSchedule = await db.query.schedule.findFirst({
    where: {
      day: { like: fns.format(body.date, 'EEEE') },
      from: body.from,
      to: body.to
    }
  });

  if (!isValidSchedule)
    throw new ApiError({ message: 'Doctor is not available at this time.' });

  if (fns.isAfter(now, fns.subHours(body.date, hoursAgo)))
    throw new ApiError({
      message: `Appointment can only be booked until ${hoursAgo} hours before the appointment date.`
    });

  return db.transaction(tx => {
    const queue = tx
      .$count(
        schema.appointment,
        sql`date(${schema.appointment.date}) = ${fns.format(body.date, 'yyyy-MM-dd')}`
      )
      .sync();

    return tx
      .insert(schema.appointment)
      .values({ ...body, patientId: user.id, queue: queue + 1 })
      .returning()
      .get();
  });
}

async function getAll(params: {
  where: Payload['where'];
  user: Model['user'];
}) {
  await isAllowed({
    permissions: { appointment: ['read'] },
    userId: params.user.id
  });

  const { pageSize, page, ...where } = params.where;

  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.appointment.findMany({
        where: {
          OR: [{ patientId: params.user.id }, { doctorId: params.user.id }],
          ...where
        },
        orderBy: { createdAt: 'desc', updatedAt: 'desc' },
        offset,
        limit
      });
    },
    async getTotal() {
      return await db.$count(schema.appointment);
    },
    pageSize,
    page
  });
}

async function deleteAppointment(params: {
  params: Payload['id'];
  user: Model['user'];
}) {
  await isAllowed({
    permissions: { appointment: ['delete'] },
    userId: params.user.id
  });

  return db.transaction(tx => {
    const deleted = tx
      .delete(schema.appointment)
      .where(eq(schema.appointment.id, params.params.id))
      .returning()
      .get();

    if (!deleted)
      throw new ApiError({ message: 'Failed to delete appointment.' });

    return deleted;
  });
}

async function get(params: { params: Payload['id']; user: Model['user'] }) {
  await isAllowed({
    permissions: { appointment: ['read'] },
    userId: params.user.id
  });

  const { id } = params.params;

  const appointment = await db.query.appointment.findFirst({ where: { id } });

  if (!appointment)
    throw new ApiError({ message: 'Failed to fetch appointment details.' });

  return appointment;
}

export const appointmentService = {
  deleteAppointment,
  confirmOrCancel,
  changeQueue,
  prescribe,
  create,
  getAll,
  rate,
  get
};
