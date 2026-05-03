import { Elysia } from 'elysia';

import type { Task } from '~/generated/prisma/client';

import { taskService } from '@/modules/task/service';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/task/model';
import { none } from '@/lib/util';

export const taskRoutes = new Elysia({ name: 'Task.Routes', prefix: '/tasks' })
  .use(loadAuthContext)
  .get(
    '/',
    async ({ user: { id: userId } }) =>
      (await taskService.get({ userId })) as Task[],
    { response: model.tasks, body: none }
  )
  .get(
    '/:id',
    async ({ user: { id: userId }, params: { id } }) =>
      (await taskService.get({ userId, id })) as Task,
    { params: model.params, response: model.task, body: none }
  )
  .delete(
    '/:id',
    async ({ user: { id: userId }, params: { id } }) =>
      await taskService.deleteTask({ userId, id }),
    { response: model.task, params: model.params, body: none }
  )
  .patch(
    '/:id',
    async ({ params: { id }, body: payload }) =>
      await taskService.update({ payload, id }),
    { response: model.task, params: model.params, body: model.payload }
  )
  .post(
    '/',
    async ({ user: { id: userId }, body: payload }) =>
      await taskService.create({ payload, userId }),
    { body: model.payload.required({ title: true }), response: model.task }
  );
