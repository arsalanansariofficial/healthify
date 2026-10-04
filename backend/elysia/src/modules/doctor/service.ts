import type { HTTPHeaders } from 'elysia/types';

import { InvertedStatusMap, StatusMap } from 'elysia';
import { sql, eq } from 'drizzle-orm';

import type { Payload } from '@/modules/doctor/payload';
import type { Model } from '@/modules/user/model';

import {
  doctorToSpecialization as dts,
  schedule as s,
  doctor as d,
  user as u,
  Role
} from '@/lib/db/schema';
import { removeUndefinedProps } from '@/lib/util';
import { paginate } from '@/lib/pagination';
import { session } from '@/lib/session';
import { ApiError } from '@/lib/error';
import { db } from '@/lib/db';

async function register(args: {
  set: { headers: HTTPHeaders };
  payload: Payload['register'];
  user: Model['user'];
  headers: Headers;
}) {
  const { specializations, schedule, doctor } = args.payload;
  const { headers, user, set } = args;

  db.transaction(tx => {
    db.delete(dts).where(eq(dts.doctorId, args.user.id)).run();
    db.delete(s).where(eq(s.doctorId, args.user.id)).run();

    tx.update(u).set({ role: Role.doctor }).where(eq(u.id, user.id)).run();
    tx.insert(d)
      .values({ ...doctor, userId: doctor.userId || user.id })
      .onConflictDoUpdate({ set: args.payload.doctor, target: d.userId })
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
        .insert(dts)
        .values({ doctorId: args.user.id, specialization: name })
        .run()
    );

    schedule.forEach(sch => {
      tx.insert(s)
        .values({ doctorId: args.user.id, ...sch })
        .run();
    });
  });

  const updated = await db.query.user.findFirst({
    with: {
      doctor: { with: { specializations: true, schedule: true } },
      profile: true
    },
    where: { id: args.user.id }
  });

  if (!updated) throw new ApiError();
  await session.update({ headers, set });
  return updated;
}

async function deRegister(args: {
  set: { headers: HTTPHeaders };
  user: Model['user'];
  headers: Headers;
}) {
  db.run(sql`pragma foreign_keys = on`);

  db.transaction(tx => {
    tx.update(u).set({ role: Role.user }).where(eq(u.id, args.user.id)).run();
    tx.delete(d).where(eq(d.userId, args.user.id)).run();
  });

  const updated = await db.query.user.findFirst({
    with: {
      doctor: { with: { specializations: true, schedule: true } },
      profile: true
    },
    where: { id: args.user.id }
  });

  if (!updated) throw new ApiError();
  await session.update({ headers: args.headers, set: args.set });
  return updated;
}

async function getAll(params: Payload['query']) {
  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.doctor.findMany({
        orderBy: { createdAt: 'desc', updatedAt: 'desc' },
        where: removeUndefinedProps(params),
        offset,
        limit
      });
    },
    async getTotal() {
      return await db.$count(s).execute();
    },
    ...params
  });
}

export const doctorService = { deRegister, register, getAll } as const;
