import { eq } from 'drizzle-orm';

import type { Payload } from '@/modules/specialization/payload';

import { paginate } from '@/lib/pagination';
import { schema } from '@/lib/db/schema';
import { ApiError } from '@/lib/error';
import { db } from '@/lib/db';

async function getAll(params: { where: Payload['where'] }) {
  const { pageSize, page, ...where } = params.where;

  return await paginate({
    async getData({ offset, limit }) {
      return await db.query.specialization.findMany({
        orderBy: { createdAt: 'desc', name: 'desc' },
        offset,
        where,
        limit
      });
    },
    async getTotal() {
      return await db.$count(schema.specialization).execute();
    },
    pageSize,
    page
  });
}

async function update(params: {
  body: Payload['update'];
  params: Payload['name'];
}) {
  const { params: p, body } = params;

  if (!body) {
    const specialization = await db.query.specialization.findFirst({
      where: { name: p.name }
    });

    if (!specialization) throw new Error();
    return specialization;
  }

  return db
    .update(schema.specialization)
    .set(body)
    .where(eq(schema.specialization.name, p.name))
    .returning()
    .get();
}

function deleteSpecialization(params: { params: Payload['name'] }) {
  const specialization = db
    .delete(schema.specialization)
    .where(eq(schema.specialization.name, params.params.name))
    .returning()
    .get();

  if (!specialization) throw new Error();
  return specialization;
}

async function get(params: { params: Payload['name'] }) {
  const specialization = await db.query.specialization.findFirst({
    where: params.params
  });

  if (!specialization) throw new ApiError();
  return specialization;
}

function create(params: { body: Payload['create'] }) {
  return db.insert(schema.specialization).values(params.body).returning().get();
}

export const specializationService = {
  deleteSpecialization,
  update,
  create,
  getAll,
  get
};
