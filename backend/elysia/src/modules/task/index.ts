import { Elysia } from 'elysia';

import type { Task } from '~/generated/prisma/client';

import { taskService } from '@/modules/task/service';
import { payload } from '@/modules/task/payload';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/task/model';
import { schema } from '@/lib/util/schema';

export const taskRoutes = new Elysia({ name: 'Task.Routes', prefix: '/tasks' })
  .use(loadAuthContext)
  .get(
    '/',
    async ({ user: { id: userId } }) =>
      (await taskService.get({ userId })) as Task[],
    { response: model.tasks }
  )
  .get(
    '/:id',
    async ({ user: { id: userId }, params: { id } }) =>
      (await taskService.get({ userId, id })) as Task,
    { params: payload.taskId, response: model.task }
  )
  .delete(
    '/:id',
    async ({ user: { id: userId }, params: { id } }) =>
      await taskService.deleteTask({ userId, id }),
    {
      body: schema.nullish('body'),
      params: payload.taskId,
      response: model.task
    }
  )
  .patch(
    '/:id',
    async ({ params: { id }, body: payload }) =>
      await taskService.update({ payload, id }),
    { body: payload.patchTask, params: payload.taskId, response: model.task }
  )
  .post(
    '/',
    async ({ user: { id: userId }, body: payload }) =>
      await taskService.create({ payload, userId }),
    { response: model.task, body: payload.task }
  );
