import { Elysia } from 'elysia';

import * as service from '@/modules/task/service';
import { model } from '@/modules/task/model';
import { auth } from '@/lib/auth';
import { none } from '@/lib/util';

export default new Elysia({ name: 'Task.Routes', prefix: '/tasks' })
  .use(auth)
  .get('/', async ({ user: { id: userId } }) => await service.get({ userId }), {
    response: model.tasks,
    body: none
  })
  .get(
    '/:id',
    async ({ user: { id: userId }, params: { id } }) =>
      await service.get({ userId, id }),
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
    { body: model.task.required({ title: true }), response: model.task }
  );
