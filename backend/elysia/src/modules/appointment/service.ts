import { count, and, avg, sql, gte, lte, eq, lt, gt } from 'drizzle-orm';
import { InvertedStatusMap, StatusMap } from 'elysia';

import type { Payload } from '@/modules/appointment/payload';
import type { Model } from '@/modules/user/model';

import { appointment as a, Status, doctor, Day } from '@/lib/db/schema';
import { removeUndefinedProps, containsSomeValue } from '@/lib/util';
import { paginate } from '@/lib/pagination';
import { ApiError } from '@/lib/error';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function update({
  payload,
  user,
  id
}: {
  payload: Payload['query'];
  user: Model['user'];
  id: string;
}) {
  let hasPermission;

  const appointment = await db.query.appointment.findFirst({
    where: { OR: [{ doctorId: user.id }, { patientId: user.id }], id }
  });

  if (!appointment)
    throw new ApiError(
      [{ message: 'Requested appointment not found.', path: [id] }],
      InvertedStatusMap[404],
      StatusMap['Not Found']
    );

  const [hours, minutes] = appointment.from.split(':').map(Number) as [
    number,
    number
  ];

  const appointmentDate = new Date(
    new Date(appointment.date).setHours(hours, minutes)
  );

  const action = {
    [Status.confirmed]: 'confirm',
    [Status.cancelled]: 'cancel'
  } as Record<Status, string>;

  if (payload.status) {
    hasPermission = await auth.api.userHasPermission({
      body: {
        permissions: {
          appointment: [action[payload.status] as 'confirm' | 'cancel']
        },
        userId: user.id
      }
    });

    if (!hasPermission.success)
      throw new ApiError(
        [
          {
            message: `You do not have permission to ${action[payload.status]} an appointment.`,
            path: [action[payload.status]]
          }
        ],
        InvertedStatusMap[400],
        StatusMap['Bad Request']
      );

    if (new Date() > appointmentDate)
      throw new ApiError(
        [
          {
            message: `You can not ${action[payload.status]} appointment in the past.`,
            path: [appointmentDate.toString(), new Date().toString()]
          }
        ],
        InvertedStatusMap[400],
        StatusMap['Bad Request']
      );
  }

  hasPermission = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['rate'] }, userId: user.id }
  });

  if (payload.rating && !hasPermission.success)
    throw new ApiError(
      [
        {
          message: 'You do not have permission to rate an appointment.',
          path: ['rate']
        }
      ],
      InvertedStatusMap[403],
      StatusMap.Forbidden
    );

  hasPermission = await auth.api.userHasPermission({
    body: { permissions: { appointment: ['update'] }, userId: user.id }
  });

  if ((payload.prescription || payload.notes) && !hasPermission.success)
    throw new ApiError(
      [
        {
          message: 'You do not have permission to update an appointment.',
          path: ['rate']
        }
      ],
      InvertedStatusMap[403],
      StatusMap.Forbidden
    );

  if (
    (payload.prescription || payload.notes || payload.rating) &&
    new Date() < appointmentDate
  )
    throw new ApiError(
      [
        {
          path: [
            appointmentDate.toString(),
            payload.rating?.toString(),
            payload.prescription,
            payload.notes
          ].filter((v): v is NonNullable<typeof v> => Boolean(v)),
          message: 'You can not update the appointment until its complete.'
        }
      ],
      InvertedStatusMap[400],
      StatusMap['Bad Request']
    );

  if (
    (payload.prescription || payload.notes || payload.rating) &&
    new Date() < appointmentDate
  )
    throw new ApiError(
      [
        {
          path: [
            appointmentDate.toString(),
            payload.rating?.toString(),
            payload.prescription,
            payload.notes
          ].filter((v): v is NonNullable<typeof v> => Boolean(v)),
          message: 'You can not update the appointment until its complete.'
        }
      ],
      InvertedStatusMap[400],
      StatusMap['Bad Request']
    );

  if (!containsSomeValue(payload)) return appointment;

  const [updated] = await db
    .update(a)
    .set(payload)
    .where(eq(a.id, id))
    .returning();

  if (!updated) throw new Error('Failed to update appointment status.');

  if (updated.rating) {
    const [{ average }] = (await db
      .select({ average: avg(a.rating) })
      .from(a)
      .where(eq(a.doctorId, appointment.doctorId))) as [{ average: string }];

    await db
      .update(doctor)
      .set({ rating: Number(average) })
      .where(eq(doctor.userId, appointment.doctorId));
  }

  return updated;
}

async function create({
  payload,
  user
}: {
  payload: Payload['appointment'];
  user: Model['user'];
}) {
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
      day: payload.date
        .toLocaleDateString('en', { weekday: 'long' })
        .toLowerCase() as Day,
      from: payload.from,
      to: payload.to
    }
  });

  if (!scheduleExist)
    throw new ApiError(
      [
        {
          message: 'Doctor is not available at this schedule.',
          path: [payload.from, payload.to]
        }
      ],
      InvertedStatusMap[400],
      StatusMap['Bad Request']
    );

  const [hours, minutes] = payload.from.split(':').map(Number) as [
    number,
    number
  ];

  const appointmentDate = new Date(
    new Date(payload.date).setHours(hours, minutes)
  );

  if (new Date() > appointmentDate)
    throw new ApiError(
      [
        {
          message: 'You can not book appointment in the past.',
          path: [payload.date.toString()]
        }
      ],
      InvertedStatusMap[400],
      StatusMap['Bad Request']
    );

  const appointments = await db
    .select()
    .from(a)
    .where(eq(a.date, payload.date));

  const [appointment] = await db
    .insert(a)
    .values({ ...payload, queue: ++appointments.length, patientId: user.id })
    .returning();

  if (!appointment) throw new Error('Failed to create appointment.');
  return appointment;
}

function changeQueue({
  appointmentId,
  newQueue
}: {
  appointmentId: string;
  newQueue: number;
}) {
  db.run(sql`pragma foreign_keys = on`);

  return db.transaction(tx => {
    const currentAppointment = tx.query.appointment
      .findFirst({ where: { id: appointmentId } })
      .sync();

    if (!currentAppointment) throw new Error('Appointment not found');

    const oldQueue = currentAppointment.queue;

    if (oldQueue === newQueue) return currentAppointment;

    const { aptCount } = tx
      .select({ aptCount: count() })
      .from(a)
      .where(
        and(
          eq(a.doctorId, currentAppointment.doctorId),
          eq(a.date, currentAppointment.date)
        )
      )
      .orderBy(a.queue)
      .get() as { aptCount: number };

    if (newQueue > aptCount)
      throw new Error(`Queue cannot be greater than ${aptCount}`);

    if (newQueue < oldQueue)
      tx.update(a)
        .set({ queue: sql`${a.queue} + 1` })
        .where(
          and(
            eq(a.doctorId, currentAppointment.doctorId),
            eq(a.date, currentAppointment.date),
            gte(a.queue, newQueue),
            lt(a.queue, oldQueue)
          )
        )
        .run();

    if (newQueue > oldQueue)
      tx.update(a)
        .set({ queue: sql`${a.queue} - 1` })
        .where(
          and(
            eq(a.doctorId, currentAppointment.doctorId),
            eq(a.date, currentAppointment.date),
            gt(a.queue, oldQueue),
            lte(a.queue, newQueue)
          )
        )
        .run();

    const updated = tx
      .update(a)
      .set({ queue: newQueue })
      .where(eq(a.id, appointmentId))
      .returning()
      .get();

    if (!updated) throw new Error('Failed to updated appointment.');
    return updated;
  });
}

async function getAll({
  params,
  user
}: {
  params: Payload['query'];
  user: Model['user'];
}) {
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

  const { pageSize, page, ...query } = params;

  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.appointment.findMany({
        where: {
          OR: [{ patientId: user.id }, { doctorId: user.id }],
          ...removeUndefinedProps(query)
        },
        orderBy: { createdAt: 'desc', updatedAt: 'desc' },
        offset,
        limit
      });
    },
    async getTotal() {
      return await db.$count(a);
    },
    pageSize,
    page
  });
}

async function get({ user, id }: { user: Model['user']; id: string }) {
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

async function deleteAppointment({
  user,
  id
}: {
  user: Model['user'];
  id: string;
}) {
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

  const [appointment] = await db.delete(a).where(eq(a.id, id)).returning();
  if (!appointment) throw new Error('Failed to delete the appointment.');
  return appointment;
}

export const appointmentService = {
  deleteAppointment,
  changeQueue,
  update,
  create,
  getAll,
  get
} as const;
