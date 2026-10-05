import { eq } from 'drizzle-orm';

import type { Payload } from '@/modules/specialization/payload';
import type { Model } from '@/modules/user/model';

import { specialization as s } from '@/lib/db/schema';
import { paginate } from '@/lib/pagination';
import { ApiError } from '@/lib/error';
import { db } from '@/lib/db';

async function getAll(params: Payload['query']) {
  const { pageSize, page, ...query } = params;

  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.specialization.findMany({
        orderBy: { createdAt: 'desc', name: 'desc' },
        where: query,
        offset,
        limit
      });
    },
    async getTotal() {
      return await db.$count(s).execute();
    },
    pageSize,
    page
  });
}

async function update(args: {
  payload: Payload['specialization'];
  user: Model['user'];
  name: string;
}) {
  const [specialization] = await db
    .update(s)
    .set(args.payload)
    .where(eq(s.name, args.name))
    .returning();

  if (!specialization) throw new ApiError();
  return specialization;
}

async function insert(args: {
  payload: Payload['specialization'];
  user: Model['user'];
}) {
  const [specialization] = await db.insert(s).values(args.payload).returning();

  if (!specialization) throw new ApiError();
  return specialization;
}

async function deleteSpecialization(name: string) {
  const [specialization] = await db
    .delete(s)
    .where(eq(s.name, name))
    .returning();

  if (!specialization) throw new ApiError();
  return specialization;
}

async function get(name: string) {
  const specialization = await db.query.specialization.findFirst({
    where: { name }
  });

  if (!specialization) throw new ApiError();
  return specialization;
}

export const specializationService = {
  deleteSpecialization,
  update,
  insert,
  getAll,
  get
} as const;
