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

async function register(
  params: WithHeaders<{ body: Payload['create']; user: Model['user'] }>
) {
  checkUserRole({ roles: params.user.role, role: 'user' });

  const { specializations, schedule, doctor } = params.body;
  const { headers, user, set } = params;

  db.transaction(tx => {
    tx.delete(schema.doctorToSpecialization)
      .where(eq(schema.doctorToSpecialization.doctorId, params.user.id))
      .run();

    tx.delete(schema.schedule)
      .where(eq(schema.schedule.doctorId, params.user.id))
      .run();

    tx.update(schema.user)
      .set({ role: Role.doctor })
      .where(eq(schema.user.id, user.id))
      .run();

    tx.insert(schema.doctor)
      .values({ ...doctor, userId: doctor.userId || user.id })
      .onConflictDoUpdate({ target: schema.doctor.userId, set: doctor })
      .run();

    const $specializations = tx.query.specialization
      .findMany({ where: { name: { in: specializations } } })
      .sync();

    if (!$specializations.length)
      throw new ApiError({ message: 'Invalid specializations.' });

    $specializations.forEach(({ name }) =>
      tx
        .insert(schema.doctorToSpecialization)
        .values({ doctorId: params.user.id, specialization: name })
        .run()
    );

    withoutOverlaps(schedule).accepted.forEach(schedule => {
      tx.insert(schema.schedule)
        .values({ doctorId: params.user.id, ...schedule })
        .run();
    });
  });

  const updated = await db.query.user.findFirst({
    with: {
      doctor: { with: { specializations: true, schedule: true } },
      profile: true
    },
    where: { id: params.user.id }
  });

  if (!updated)
    throw new ApiError({ message: 'Failed to update appointment.' });

  await session.update({ headers, set });
  return updated;
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

async function deRegister(params: WithHeaders<{ user: Model['user'] }>) {
  checkUserRole({ roles: params.user.role, role: 'doctor' });

  db.transaction(tx => {
    tx.update(schema.user)
      .set({ role: Role.user })
      .where(eq(schema.user.id, params.user.id))
      .run();

    tx.delete(schema.doctor)
      .where(eq(schema.doctor.userId, params.user.id))
      .run();
  });

  const updated = await db.query.user.findFirst({
    with: {
      doctor: { with: { specializations: true, schedule: true } },
      profile: true
    },
    where: { id: params.user.id }
  });

  if (!updated)
    throw new ApiError({ message: 'Failed to update appointment.' });

  await session.update({ headers: params.headers, set: params.set });
  return updated;
}

async function getAll(params: { where: Payload['where'] }) {
  const { pageSize, page, ...where } = params.where;

  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.doctor.findMany({
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

export const doctorService = { deRegister, register, getAll };
