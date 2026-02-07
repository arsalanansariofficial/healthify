import { Elysia } from 'elysia';

import * as service from '@/modules/task/service';
import { model } from '@/modules/task/model';
import { auth } from '@/utils/auth';

const router = new Elysia({ prefix: '/tasks', name: 'task' });

router.group('', app =>
  app
    .use(auth)
    .get('/', async () => await service.get(), {
      response: model.tasksResponse
    })
    .get('/:id', async ({ params: { id } }) => await service.get(id), {
      response: model.taskResponse,
      params: model.params
    })
    .delete(
      '/:id',
      async ({ params: { id } }) => await service.deleteTask(id),
      { response: model.taskResponse, params: model.params }
    )
    .patch(
      '/:id',
      async ({ params: { id }, body }) => await service.update(id, body),
      {
        body: model.taskUpdateRequest,
        response: model.taskResponse,
        params: model.params
      }
    )
    .post(
      '/',
      async ({ user: { id }, body }) => await service.create(id, body),
      { response: model.taskResponse, body: model.taskRequest }
    )
);

export default router;
