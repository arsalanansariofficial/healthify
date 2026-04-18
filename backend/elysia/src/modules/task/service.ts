import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import { removeUndefinedProps } from '@/lib/util';
import { type Model } from '@/modules/task/model';
import { TaskNotFoundError } from '@/lib/error';
import { prisma } from '@/lib/prisma';

export async function get({ userId, id }: { userId: string; id?: string }) {
  if (id) {
    const task = await prisma.task.findUnique({ where: { userId, id } });
    if (!task)
      throw new TaskNotFoundError([
        {
          message: `Requested task with ${id} for user ${userId} does not exist.`,
          path: [id, userId]
        }
      ]);
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
      throw new TaskNotFoundError([
        {
          message: `Requested task with ${id} for user ${userId} does not exist.`,
          path: [id, userId]
        }
      ]);
    throw error;
  }
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

export async function create({
  payload,
  userId
}: {
  payload: Model['payload'];
  userId: string;
}) {
  return await prisma.task.create({ data: { ...payload, userId } });
}
