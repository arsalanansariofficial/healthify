import { TaskNotFoundError } from '@/utils/error';
import { type Model } from '@/modules/task/model';
import { getDefinedKeys } from '@/utils/lib';
import { prisma } from '@/utils/prisma';

export function get(id: string): Promise<Model['taskResponse']>;
export function get(): Promise<Model['taskResponse'][]>;
export async function get(id?: string) {
  if (id) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new TaskNotFoundError([id]);
    return task as Model['taskResponse'];
  }

  return (await prisma.task.findMany()) as Model['taskResponse'][];
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
