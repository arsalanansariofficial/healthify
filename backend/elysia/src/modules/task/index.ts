import { Elysia } from 'elysia';

import * as service from '@/modules/task/service';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/task/model';
import { none } from '@/lib/util';

export const taskRoutes = new Elysia({ name: 'Task.Routes', prefix: '/tasks' })
  .use(loadAuthContext)
  .get(
    '/',
    async ({ user: { id: userId } }) =>
      model.tasks.parse(await service.get({ userId })),
    { response: model.tasks, body: none }
  )
  .get(
    '/:id',
    async ({ user: { id: userId }, params: { id } }) =>
      model.task.parse(await service.get({ userId, id })),
    { params: model.params, response: model.task, body: none }
  )
  .delete(
    '/:id',
    async ({ user: { id: userId }, params: { id } }) =>
      await service.deleteTask({ userId, id }),
    { response: model.task, params: model.params, body: none }
  )
  .patch(
    '/:id',
    async ({ params: { id }, body: payload }) =>
      await service.update({ payload, id }),
    { response: model.task, params: model.params, body: model.task }
  )
  .post(
    '/',
    async ({ user: { id: userId }, body: payload }) =>
      await service.create({ payload, userId }),
    { response: model.task, body: model.payload }
  );
