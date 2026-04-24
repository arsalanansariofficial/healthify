import { beforeEach, afterAll, expect, test } from 'bun:test';
import { HttpStatusCode } from 'axios';

import type { Task } from '~/generated/prisma/client';

import {
  getSessionCookie,
  resetDisk,
  setupDb,
  resetDb,
  kevin,
  gwen,
  api,
  ben
} from '@/tests/fixtures/db';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

afterAll(async () => {
  await Promise.all([resetDb(), resetDisk()]);
  await prisma.$disconnect();
});
beforeEach(setupDb);

test('should create task for user', async () => {
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...gwen }
  });

  const { status, data } = await api.tasks.post(
    { title: 'Work with Charm Caster' },
    getSessionCookie(headers)
  );

  const task = await prisma.task.findUnique({ where: { id: data?.id } });
  expect(task?.status).toBe('incomplete');
  expect(status).toBe(HttpStatusCode.Ok);
  expect(task).not.toBeNull();
});

test('ben should not delete task created by kevin', async () => {
  const [$task] = kevin.tasks as [Task];
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...ben }
  });

  const { status } = await api
    .tasks({ id: $task.id })
    .delete(undefined, getSessionCookie(headers));

  const task = await prisma.task.findUnique({ where: { id: $task.id } });
  expect(status).toBe(HttpStatusCode.BadRequest);
  expect(task).not.toBeNull();
});

test('should fetch tasks for user', async () => {
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...gwen }
  });

  const { status, data } = await api.tasks.get(getSessionCookie(headers));
  expect(status).toBe(HttpStatusCode.Ok);
  expect(data?.length).toBe(1);
});
