import { InvertedStatusMap, StatusMap } from 'elysia';
import { sql, eq } from 'drizzle-orm';

import type { Payload } from '@/modules/doctor/payload';
import type { WithHeaders } from '@/lib/util/types';
import type { Model } from '@/modules/user/model';

import { schema, Role } from '@/lib/db/schema';
import { paginate } from '@/lib/pagination';
import { session } from '@/lib/session';
import { ApiError } from '@/lib/error';
import { db } from '@/lib/db';

async function register(
  params: WithHeaders<{ body: Payload['create']; user: Model['user'] }>
) {
  const { specializations, schedule, doctor } = params.body;
  const { headers, user, set } = params;

  db.transaction(tx => {
    db.delete(schema.doctorToSpecialization)
      .where(eq(schema.doctorToSpecialization.doctorId, params.user.id))
      .run();

    db.delete(schema.schedule)
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
      throw new ApiError(
        [{ message: 'Invalid specialization.', path: specializations }],
        InvertedStatusMap[StatusMap['Bad Request']],
        StatusMap['Bad Request']
      );

    $specializations.forEach(({ name }) =>
      tx
        .insert(schema.doctorToSpecialization)
        .values({ doctorId: params.user.id, specialization: name })
        .run()
    );

    schedule.forEach(schedule => {
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

  if (!updated) throw new ApiError();
  await session.update({ headers, set });
  return updated;
}

async function deRegister(params: WithHeaders<{ user: Model['user'] }>) {
  db.run(sql`pragma foreign_keys = on`);

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

  if (!updated) throw new ApiError();
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
      return await db.$count(schema.schedule).execute();
    },
    pageSize,
    page
  });
}

export const doctorService = { deRegister, register, getAll };
