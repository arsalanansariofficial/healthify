import { beforeEach, afterAll, expect, test } from 'bun:test';
import { HttpStatusCode } from 'axios';

import { cleanupDb, setupDb, kevin, gwen, api, ben } from '@/tests/fixtures/db';
import { generateToken } from '@/lib/token';
import { prisma } from '@/lib/prisma';

beforeEach(setupDb);
afterAll(cleanupDb);

test('should create task for user', async () => {
  const { status, data } = await api.tasks.post(
    { title: 'Work with Charm Caster' },
    { headers: { Cookie: `jwt=${generateToken(gwen.id as string)}` } }
  );

  const task = await prisma.task.findUnique({ where: { id: data?.id } });
  expect(task?.status).toBe('incomplete');
  expect(task).not.toBeNull();
  expect(status).toBe(HttpStatusCode.Ok);
});

test('ben should not delete task created by kevin', async () => {
  const [$task] = kevin.tasks;
  const { status } = await api
    .tasks({ id: $task!.id })
    .delete(undefined, { headers: { Cookie: `jwt=${generateToken(ben.id)}` } });

  const task = await prisma.task.findUnique({ where: { id: $task?.id } });
  expect(task).not.toBeNull();
  expect(status).toBe(HttpStatusCode.BadRequest);
});

test('should fetch tasks for user', async () => {
  const { status, data } = await api.tasks.get({
    headers: { Cookie: `jwt=${generateToken(gwen.id as string)}` }
  });

  expect(data?.length).toBe(1);
  expect(status).toBe(HttpStatusCode.Ok);
});
