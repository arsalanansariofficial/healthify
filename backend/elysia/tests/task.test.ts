import { beforeEach, afterAll, describe, expect, test } from 'bun:test';
import { StatusMap } from 'elysia';

import type { Task } from '~/generated/prisma/client';

import {
  getSessionCookie,
  kevinsTasks,
  resetDisk,
  setupDb,
  resetDb,
  gwen,
  api,
  ben
} from '@/tests/fixtures/db';
import { prisma } from '@/lib/prisma';
import { ctx } from '@/lib/auth';

describe('tests for task resource', () => {
  afterAll(async () => {
    await Promise.all([resetDb(), resetDisk()]);
    await prisma.$disconnect();
  });

  beforeEach(setupDb);

  test('should create task for user', async () => {
    const headers = await ctx.getAuthHeaders({ userId: gwen.id });
    const { status, data } = await api.tasks.post(
      { title: 'Work with Charm Caster' },
      getSessionCookie(headers)
    );

    const task = await prisma.task.findUnique({ where: { id: data?.id } });
    expect(task?.status).toBe('incomplete');
    expect(status).toBe(StatusMap.OK);
    expect(task).not.toBeNull();
  });

  test('ben should not delete task created by kevin', async () => {
    const headers = await ctx.getAuthHeaders({ userId: ben.id });
    const [$task] = kevinsTasks as [Task];

    const { status } = await api
      .tasks({ id: $task.id })
      .delete(undefined, getSessionCookie(headers));
    expect(status).toBe(StatusMap['Bad Request']);

    const task = await prisma.task.findUnique({ where: { id: $task.id } });
    expect(task).not.toBeNull();
  });

  test('should fetch tasks for user', async () => {
    const headers = await ctx.getAuthHeaders({ userId: gwen.id });
    const { status, data } = await api.tasks.get(getSessionCookie(headers));
    expect(status).toBe(StatusMap.OK);
    expect(data?.length).toBe(1);
  });
});
