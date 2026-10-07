import { count, and, avg, sql, gte, lte, eq, lt, gt } from 'drizzle-orm';
import { InvertedStatusMap, StatusMap } from 'elysia';

import type { Payload } from '@/modules/appointment/payload';
import type { Model } from '@/modules/user/model';
import type { Schema } from '@/lib/util/schema';

import { Status, schema, Day } from '@/lib/db/schema';
import { paginate } from '@/lib/pagination';
import { ApiError } from '@/lib/error';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function changeQueue(params: {
  body: Payload['changeQueue'];
  user: Model['user'];
}) {
  const error = new Error() as Record<string, unknown> & Error;
  const { user, body } = params;

  const { success: canUpdate } = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['update'] }, userId: user.id }
  });

  if (!canUpdate) {
    error.message = 'No permission to update the appointment.';
    error.statusCode = StatusMap.Forbidden;
    throw error;
  }

  db.run(sql`pragma foreign_keys = on`);

  return db.transaction(tx => {
    const currentAppointment = tx.query.appointment
      .findFirst({ where: { id: body.id } })
      .sync();

    if (!currentAppointment) throw new Error('Appointment not found');

    const oldQueue = currentAppointment.queue;

    if (oldQueue === body.queue) return currentAppointment;

    const { aptCount } = tx
      .select({ aptCount: count() })
      .from(schema.appointment)
      .where(
        and(
          eq(schema.appointment.doctorId, currentAppointment.doctorId),
          eq(schema.appointment.date, currentAppointment.date)
        )
      )
      .orderBy(schema.appointment.queue)
      .get() as { aptCount: number };

    if (body.queue > aptCount)
      throw new Error(`Queue cannot be greater than ${aptCount}`);

    if (body.queue < oldQueue)
      tx.update(schema.appointment)
        .set({ queue: sql`${schema.appointment.queue} + 1` })
        .where(
          and(
            eq(schema.appointment.doctorId, currentAppointment.doctorId),
            eq(schema.appointment.date, currentAppointment.date),
            gte(schema.appointment.queue, body.queue),
            lt(schema.appointment.queue, oldQueue)
          )
        )
        .run();

    if (body.queue > oldQueue)
      tx.update(schema.appointment)
        .set({ queue: sql`${schema.appointment.queue} - 1` })
        .where(
          and(
            eq(schema.appointment.doctorId, currentAppointment.doctorId),
            eq(schema.appointment.date, currentAppointment.date),
            gt(schema.appointment.queue, oldQueue),
            lte(schema.appointment.queue, body.queue)
          )
        )
        .run();

    const updated = tx
      .update(schema.appointment)
      .set({ queue: body.queue })
      .where(eq(schema.appointment.id, body.id))
      .returning()
      .get();

    if (!updated) throw new Error('Failed to updated appointment.');
    return updated;
  });
}

async function create(params: {
  body: Payload['create'];
  user: Model['user'];
}) {
  const { user, body } = params;

  const hasPermission = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['create'] }, userId: user.id }
  });

  if (!hasPermission.success)
    throw new ApiError(
      [
        {
          message: 'You do not have permission to create an appointment.',
          path: ['/appointments']
        }
      ],
      InvertedStatusMap[403],
      StatusMap.Forbidden
    );

  const scheduleExist = await db.query.schedule.findFirst({
    where: {
      day: body.date
        .toLocaleDateString('en', { weekday: 'long' })
        .toLowerCase() as Day,
      from: body.from,
      to: body.to
    }
  });

  if (!scheduleExist)
    throw new ApiError(
      [
        {
          message: 'Doctor is not available at this schedule.',
          path: [body.from, body.to]
        }
      ],
      InvertedStatusMap[400],
      StatusMap['Bad Request']
    );

  const [hours, minutes] = body.from.split(':').map(Number) as [number, number];

  const appointmentDate = new Date(
    new Date(body.date).setHours(hours, minutes)
  );

  if (new Date() > appointmentDate)
    throw new ApiError(
      [
        {
          message: 'You can not book appointment in the past.',
          path: [body.date.toString()]
        }
      ],
      InvertedStatusMap[400],
      StatusMap['Bad Request']
    );

  const appointments = await db
    .select()
    .from(schema.appointment)
    .where(eq(schema.appointment.date, body.date));

  const [appointment] = await db
    .insert(schema.appointment)
    .values({ ...body, queue: ++appointments.length, patientId: user.id })
    .returning();

  if (!appointment) throw new Error('Failed to create appointment.');
  return appointment;
}

async function rate(params: {
  body: Payload['rate'];
  params: Payload['id'];
  user: Model['user'];
}) {
  const error = new Error() as Record<string, unknown> & Error;
  const { params: qp, user, body } = params;

  const { success: canRate } = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['rate'] }, userId: user.id }
  });

  if (!canRate) {
    error.message = 'No permission to rate the appointment.';
    error.statusCode = StatusMap.Forbidden;
    throw error;
  }

  const appointment = await db.query.appointment.findFirst({
    where: { OR: [{ doctorId: user.id }, { patientId: user.id }], id: qp.id }
  });

  if (!appointment) {
    error.message = `Appointment with id ${qp.id} does not exists.`;
    error.statusCode = StatusMap['Not Found'];
    throw error;
  }

  const [hours, minutes] = appointment.from.split(':').map(Number) as [
    number,
    number
  ];

  const appointmentDate = new Date(
    new Date(appointment.date).setHours(hours, minutes)
  );

  if (new Date() < appointmentDate) {
    error.message = 'You can not rate the appointment until it is completed.';
    error.statusCode = StatusMap['Bad Request'];
    throw error;
  }

  const updated = db
    .update(schema.appointment)
    .set(body)
    .where(eq(schema.appointment.id, qp.id))
    .returning()
    .get();

  const average = db
    .select({ rating: avg(schema.appointment.rating) })
    .from(schema.appointment)
    .where(eq(schema.appointment.doctorId, appointment.doctorId))
    .get();

  db.update(schema.doctor)
    .set({ rating: Number(average?.rating || 0) })
    .where(eq(schema.doctor.userId, appointment.doctorId))
    .run();

  return updated;
}

async function update(params: {
  body: Payload['update'];
  user: Model['user'];
}) {
  const error = new Error() as Record<string, unknown> & Error;
  const { user, body } = params;

  const { success: canUpdate } = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['update'] }, userId: user.id }
  });

  if (!canUpdate) {
    error.message = 'No permission to update the appointment.';
    error.statusCode = StatusMap.Forbidden;
    throw error;
  }

  if (!body || !body?.id) throw error;

  const appointment = await db.query.appointment.findFirst({
    where: { OR: [{ doctorId: user.id }, { patientId: user.id }], id: body.id }
  });

  if (!appointment) {
    error.message = `Appointment with id ${body.id} does not exists.`;
    error.statusCode = StatusMap['Not Found'];
    throw error;
  }

  const [hours, minutes] = appointment.from.split(':').map(Number) as [
    number,
    number
  ];

  const appointmentDate = new Date(
    new Date(appointment.date).setHours(hours, minutes)
  );

  if (new Date() < appointmentDate) {
    error.message = `You can not update appointment until it is completed.`;
    error.statusCode = StatusMap['Bad Request'];
    throw error;
  }

  return db
    .update(schema.appointment)
    .set(body)
    .where(eq(schema.appointment.id, body.id))
    .returning()
    .get();
}

async function getAll(params: {
  query: Schema['pageQuery'];
  where: Payload['where'];
  user: Model['user'];
}) {
  const { where, query, user } = params;

  const hasPermission = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['read'] }, userId: user.id }
  });

  if (!hasPermission.success)
    throw new ApiError(
      [
        {
          message: 'You do not have permission to view appointments.',
          path: []
        }
      ],
      InvertedStatusMap[403],
      StatusMap.Forbidden
    );

  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.appointment.findMany({
        where: {
          OR: [{ patientId: user.id }, { doctorId: user.id }],
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
    ...query
  });
}

async function confirm({
  user,
  body
}: {
  user: Model['user'];
  body: Payload['id'];
}) {
  const { id } = body;

  const error = new Error() as Record<string, unknown> & Error;

  const { success: canConfirm } = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['confirm'] }, userId: user.id }
  });

  if (!canConfirm) {
    error.message = 'No permission to confirm the appointment.';
    error.statusCode = StatusMap.Forbidden;
    throw error;
  }

  const appointment = await db.query.appointment.findFirst({
    where: { OR: [{ doctorId: user.id }, { patientId: user.id }], id }
  });

  if (!appointment) {
    error.message = `Appointment with id ${id} does not exists.`;
    error.statusCode = StatusMap['Not Found'];
    throw error;
  }

  return db
    .update(schema.appointment)
    .set({ status: Status.confirmed })
    .where(eq(schema.appointment.id, id))
    .returning()
    .get();
}

async function cancel({
  user,
  body
}: {
  user: Model['user'];
  body: Payload['id'];
}) {
  const { id } = body;

  const error = new Error() as Record<string, unknown> & Error;

  const { success: canCancel } = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['cancel'] }, userId: user.id }
  });

  if (!canCancel) {
    error.message = 'No permission to cancel the appointment.';
    error.statusCode = StatusMap.Forbidden;
    throw error;
  }

  const appointment = await db.query.appointment.findFirst({
    where: { OR: [{ doctorId: user.id }, { patientId: user.id }], id }
  });

  if (!appointment) {
    error.message = `Appointment with id ${id} does not exists.`;
    error.statusCode = StatusMap['Not Found'];
    throw error;
  }

  return db
    .update(schema.appointment)
    .set({ status: Status.cancelled })
    .where(eq(schema.appointment.id, id))
    .returning()
    .get();
}

async function deleteAppointment({
  body,
  user
}: {
  user: Model['user'];
  body: Payload['id'];
}) {
  const { id } = body;

  const hasPermission = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['delete'] }, userId: user.id }
  });

  if (!hasPermission.success)
    throw new ApiError(
      [
        {
          message: 'You do not have permission to delete this appointment.',
          path: [id]
        }
      ],
      InvertedStatusMap[403],
      StatusMap.Forbidden
    );

  const [appointment] = await db
    .delete(schema.appointment)
    .where(eq(schema.appointment.id, id))
    .returning();
  if (!appointment) throw new Error('Failed to delete the appointment.');
  return appointment;
}

async function get({
  user,
  body
}: {
  user: Model['user'];
  body: Payload['id'];
}) {
  const { id } = body;

  const hasPermission = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['read'] }, userId: user.id }
  });

  if (!hasPermission.success)
    throw new ApiError(
      [
        {
          message:
            'You do not have permission to view the details for this appointment.',
          path: [id]
        }
      ],
      InvertedStatusMap[403],
      StatusMap.Forbidden
    );

  const appointment = await db.query.appointment.findFirst({ where: { id } });

  if (!appointment) throw new Error('Failed to fetch the appointment details.');
  return appointment;
}

export const appointmentService = {
  deleteAppointment,
  changeQueue,
  confirm,
  update,
  create,
  cancel,
  getAll,
  rate,
  get
} as const;
