import { TaskNotFoundError } from '@/utils/error';
import { type Model } from '@/modules/task/model';
import { getDefinedKeys } from '@/utils/lib';
import { prisma } from '@/utils/prisma';

export function get(id: string, userId: string): Promise<Model['taskResponse']>;
export function get(userId: string): Promise<Model['taskResponse'][]>;
export async function get(userId: string, id?: string) {
  if (id) {
    const task = await prisma.task.findUnique({ where: { userId, id } });
    if (!task) throw new TaskNotFoundError([id, userId]);
    return task as Model['taskResponse'];
  }

  const tasks = await prisma.task.findMany({ where: { userId } });
  return tasks as Model['taskResponse'][];
}

export async function update(id: string, payload: Model['taskUpdateRequest']) {
  return await prisma.task.update({
    data: getDefinedKeys(payload),
    where: { id }
  });
}

export async function create(userId: string, payload: Model['taskRequest']) {
  return await prisma.task.create({ data: { ...payload, userId } });
}

export async function deleteTask(id: string) {
  return await prisma.task.delete({ where: { id } });
}
