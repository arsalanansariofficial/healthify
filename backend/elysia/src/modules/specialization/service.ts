import { eq } from 'drizzle-orm';

import type { Payload } from '@/modules/specialization/payload';
import type { Model } from '@/modules/user/model';

import { checkUserPermission } from '@/lib/util';
import { paginate } from '@/lib/pagination';
import { schema } from '@/lib/db/schema';
import { ApiError } from '@/lib/error';
import { db } from '@/lib/db';

async function update(params: {
  body: Payload['update'];
  params: Payload['name'];
  user: Model['user'];
}) {
  await checkUserPermission({
    permissions: { specialization: ['update'] },
    userId: params.user.id
  });

  const { name } = params.params;
  const { body } = params;

  if (!body) {
    const specialization = await db.query.specialization.findFirst({
      where: { name }
    });

    if (!specialization)
      throw new ApiError({ message: 'Failed to update specialization.' });

    return specialization;
  }

  return db
    .update(schema.specialization)
    .set(body)
    .where(eq(schema.specialization.name, name))
    .returning()
    .get();
}

async function deleteSpecialization(params: {
  params: Payload['name'];
  user: Model['user'];
}) {
  await checkUserPermission({
    permissions: { specialization: ['delete'] },
    userId: params.user.id
  });

  const specialization = db
    .delete(schema.specialization)
    .where(eq(schema.specialization.name, params.params.name))
    .returning()
    .get();

  if (!specialization)
    throw new ApiError({ message: 'Failed to delte specialization.' });

  return specialization;
}

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

async function get(params: { params: Payload['name'] }) {
  const { name } = params.params;

  const specialization = await db.query.specialization.findFirst({
    where: { name }
  });

  if (!specialization)
    throw new ApiError({ message: 'Failed to fetch specialization details.' });

  return specialization;
}

async function create(params: {
  body: Payload['create'];
  user: Model['user'];
}) {
  await checkUserPermission({
    permissions: { specialization: ['create'] },
    userId: params.user.id
  });

  return db.insert(schema.specialization).values(params.body).returning().get();
}

export const specializationService = {
  deleteSpecialization,
  update,
  create,
  getAll,
  get
};
