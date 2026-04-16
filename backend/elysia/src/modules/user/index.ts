import { Elysia } from 'elysia';

import * as service from '@/modules/user/service';
import { model } from '@/modules/user/model';
import { loadAuthContext } from '@/lib/auth';
import { none } from '@/lib/util';

export const userRoutes = new Elysia({ name: 'User.Routes', prefix: '/users' })
  .use(loadAuthContext)
  .get('/me', ({ user }) => model.user.parse(user), {
    response: model.user,
    body: none
  })
  .delete(
    '/me',
    async ({ user }) => model.user.parse(await service.deleteUser(user.id)),
    { response: model.user, body: none }
  )
  .patch(
    '/me',
    async ({ user, body }) => {
      const result = await service.update({ payload: body, user });
      return result;
    },
    { response: model.user, body: model.payload }
  );
