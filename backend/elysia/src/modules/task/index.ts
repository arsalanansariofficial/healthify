import { Elysia } from 'elysia';

import * as service from '@/modules/task/service';
import { model } from '@/modules/task/model';
import { auth } from '@/utils/auth';
import { none } from '@/utils/lib';

export default new Elysia({ name: 'Task.Routes', prefix: '/tasks' })
  .use(auth)
  .get('/', async ({ user: { id } }) => await service.get(id), {
    response: model.tasks,
    body: none
  })
  .get(
    '/:id',
    async ({ params: { id }, user }) => await service.get(user.id, id),
    { params: model.params, response: model.task, body: none }
  )
  .delete(
    '/:id',
    async ({ params: { id }, user }) => await service.deleteTask(user.id, id),
    { response: model.task, params: model.params, body: none }
  )
  .patch(
    '/:id',
    async ({ params: { id }, body }) => await service.update(id, body),
    { response: model.task, params: model.params, body: model.task }
  )
  .post('/', async ({ user: { id }, body }) => await service.create(id, body), {
    body: model.task.required({ title: true }),
    response: model.task
  });
