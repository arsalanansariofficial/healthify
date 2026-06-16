import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

import type { Payload } from '@/modules/task/payload';

import { TaskNotFoundError } from '@/lib/error';
import { prisma } from '@/lib/prisma';

async function get({ userId, id }: { userId: string; id?: string }) {
  if (id) {
    const task = await prisma.task.findUnique({ where: { userId, id } });
    if (!task)
      throw new TaskNotFoundError([
        {
          message: `Requested task with ${id} for user ${userId} does not exist.`,
          path: [id, userId]
        }
      ]);
    return task;
  }

  return await prisma.task.findMany({ where: { userId } });
}

async function deleteTask({ userId, id }: { userId: string; id: string }) {
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

async function update(args: { payload: Payload['patchTask']; id: string }) {
  return await prisma.task.update({
    where: { id: args.id },
    data: args.payload
  });
}

async function create(args: { payload: Payload['task']; userId: string }) {
  return await prisma.task.create({
    data: { ...args.payload, userId: args.userId }
  });
}

export const taskService = { deleteTask, update, create, get };
