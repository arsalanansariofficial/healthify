import { TaskNotFoundError } from '@/utils/error';
import { type Model } from '@/modules/task/model';
import { prisma } from '@/utils/prisma';

export async function get(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new TaskNotFoundError([id]);
  return task;
}

export async function create(userId: string, payload: Model['taskRequest']) {
  return await prisma.task.create({ data: { ...payload, userId } });
}

export async function update(id: string, payload: Model['taskRequest']) {
  return await prisma.task.update({ data: payload, where: { id } });
}

export async function deleteTask(id: string) {
  return await prisma.task.delete({ where: { id } });
}
