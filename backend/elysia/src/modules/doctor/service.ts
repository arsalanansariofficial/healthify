import { eq } from 'drizzle-orm';

import type { Model as DoctorModel } from '@/modules/doctor/model';
import type { Payload } from '@/modules/doctor/payload';
import type { WithHeaders } from '@/lib/util/types';
import type { Model } from '@/modules/user/model';

import { checkUserRole, toMinutes } from '@/lib/util';
import { schema, Role } from '@/lib/db/schema';
import { paginate } from '@/lib/pagination';
import { session } from '@/lib/session';
import { ApiError } from '@/lib/error';
import { db } from '@/lib/db';

type Schedule = Pick<DoctorModel['schedule'], 'from' | 'day' | 'to'>;
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function register(
  params: WithHeaders<{ body: Payload['create']; user: Model['user'] }>
) {
  checkUserRole({ roles: params.user.role, role: 'user' });

  const { specializations, schedule, doctor } = params.body;
  const { headers, user, set } = params;

  db.transaction(tx => {
    tx.update(schema.user)
      .set({ role: Role.doctor })
      .where(eq(schema.user.id, user.id))
      .run();

    tx.insert(schema.doctor)
      .values({ ...doctor, userId: doctor.userId || user.id })
      .onConflictDoUpdate({ target: schema.doctor.userId, set: doctor })
      .run();

    if (specializations)
      updateSpecializations({
        doctorId: doctor.userId || user.id,
        specializations,
        tx
      });

    if (schedule)
      updateSchedule({ doctorId: doctor.userId || user.id, schedule, tx });
  });

  return await get({
    params: { userId: doctor?.userId || user.id },
    headers,
    set
  });
}

async function update(
  params: WithHeaders<{ body: Payload['update']; user: Model['user'] }>
) {
  checkUserRole({ roles: params.user.role, role: 'doctor' });

  const { specializations, schedule, doctor } = params.body || {};
  const { headers, user, set } = params;

  db.transaction(tx => {
    tx.update(schema.doctor)
      .set({ ...doctor })
      .where(eq(schema.doctor.userId, doctor?.userId || user.id))
      .run();

    if (specializations)
      updateSpecializations({
        doctorId: doctor?.userId || user.id,
        specializations,
        tx
      });

    if (schedule)
      updateSchedule({ doctorId: doctor?.userId || user.id, schedule, tx });
  });

  return await get({
    params: { userId: doctor?.userId || user.id },
    headers,
    set
  });
}

function withoutOverlaps(slots: Schedule[]) {
  return slots.reduce(
    (result, slot) => {
      const start = toMinutes(slot.from);
      const end = toMinutes(slot.to);

      if (start >= end)
        throw new ApiError({
          message: `Invalid schedule: ${slot.from} must be earlier than ${slot.to}.`
        });

      const overlaps = result.accepted.some(existing => {
        if (existing.day !== slot.day) return false;

        const existingStart = toMinutes(existing.from);
        const existingEnd = toMinutes(existing.to);

        return start < existingEnd && end > existingStart;
      });

      (overlaps ? result.skipped : result.accepted).push(slot);
      return result;
    },
    { accepted: [] as Schedule[], skipped: [] as Schedule[] }
  );
}

function updateSpecializations(params: {
  specializations: string[];
  doctorId: string;
  tx: Tx;
}) {
  const { specializations, doctorId, tx } = params;

  tx.delete(schema.doctorToSpecialization)
    .where(eq(schema.doctorToSpecialization.doctorId, doctorId))
    .run();

  const $specializations = tx.query.specialization
    .findMany({ where: { name: { in: specializations } } })
    .sync();

  if (!$specializations.length)
    throw new ApiError({ message: 'Invalid specializations.' });

  $specializations.forEach(({ name: specialization }) =>
    tx
      .insert(schema.doctorToSpecialization)
      .values({ specialization, doctorId })
      .run()
  );
}

async function getAll(params: { where: Payload['where'] }) {
  const { pageSize, page, ...where } = params.where;

  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.doctor.findMany({
        with: {
          specializations: true,
          schedule: true,
          profile: true,
          user: true
        },
        orderBy: { createdAt: 'desc', updatedAt: 'desc' },
        offset,
        where,
        limit
      });
    },
    async getTotal() {
      return db.$count(schema.schedule).sync();
    },
    pageSize,
    page
  });
}

async function deRegister(params: WithHeaders<{ user: Model['user'] }>) {
  checkUserRole({ roles: params.user.role, role: 'doctor' });
  const { headers, user, set } = params;

  db.transaction(tx => {
    tx.update(schema.user)
      .set({ role: Role.user })
      .where(eq(schema.user.id, user.id))
      .run();

    tx.delete(schema.doctor).where(eq(schema.doctor.userId, user.id)).run();
  });

  return await get({ params: { userId: user.id }, headers, set });
}

async function get(params: WithHeaders<{ params: Payload['userId'] }>) {
  const user = await db.query.user.findFirst({
    with: {
      doctor: { with: { specializations: true, schedule: true } },
      profile: true
    },
    where: { id: params.params.userId }
  });

  if (!user) throw new ApiError({ message: 'Failed to get user.' });
  await session.update({ headers: params.headers, set: params.set });
  return user;
}

function updateSchedule(params: {
  schedule: Schedule[];
  doctorId: string;
  tx: Tx;
}) {
  const { doctorId, schedule, tx } = params;

  tx.delete(schema.schedule)
    .where(eq(schema.schedule.doctorId, doctorId))
    .run();

  withoutOverlaps(schedule).accepted.forEach(schedule => {
    tx.insert(schema.schedule)
      .values({ doctorId, ...schedule })
      .run();
  });
}

export const service = { deRegister, register, update, getAll };
