import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import { removeUndefinedProps, type RequireFields } from '@/utils/lib';
import { type Model } from '@/modules/task/model';
import { TaskNotFoundError } from '@/utils/error';
import { prisma } from '@/utils/prisma';

export function get(payload: {
  userId: string;
  id: string;
}): Promise<Model['task']>;
export function get(payload: { userId: string }): Promise<Model['tasks']>;
export async function get({ userId, id }: { userId: string; id?: string }) {
  if (id) {
    const task = await prisma.task.findUnique({ where: { userId, id } });
    if (!task) throw new TaskNotFoundError([id, userId]);
    return task as Model['task'];
  }

  const tasks = await prisma.task.findMany({ where: { userId } });
  return tasks as Model['tasks'];
}

export async function deleteTask({
  userId,
  id
}: {
  userId: string;
  id: string;
}) {
  try {
    return await prisma.task.delete({ where: { userId, id } });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError)
      throw new TaskNotFoundError([id, userId]);
    throw error;
  }
}

export async function create({
  payload,
  userId
}: {
  payload: RequireFields<Model['task'], 'title'>;
  userId: string;
}) {
  return await prisma.task.create({ data: { ...payload, userId } });
}

export async function update({
  payload,
  id
}: {
  payload: Model['task'];
  id: string;
}) {
  return await prisma.task.update({
    data: removeUndefinedProps(payload),
    where: { id }
  });
}
