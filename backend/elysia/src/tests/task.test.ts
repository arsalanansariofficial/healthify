import { describe, expect, it } from 'bun:test';

import { setUpTests, login, task, user, api } from '@/tests/lib';
import { prisma } from '@/utils/prisma';

setUpTests();

describe('Task routes', () => {
  it('returns a single task by id', async () => {
    const cookie = await login();
    const { id: userId } = (await prisma.user.findUnique({
      where: { email: user.email }
    }))!;

    const { id } = await prisma.task.create({ data: { ...task, userId } });
    const { status } = await api
      .tasks({ id })
      .get({ headers: { Cookie: cookie } });

    expect(status).toBe(200);
  });

  it('creates a task for the authenticated user', async () => {
    const cookie = await login();
    const { status } = await api.tasks.post(task, {
      headers: { Cookie: cookie }
    });

    expect(status).toBe(200);
  });

  it('returns an empty task list for a fresh user', async () => {
    const cookie = await login();
    const { status } = await api.tasks.get({ headers: { Cookie: cookie } });
    expect(status).toBe(200);
  });
});
