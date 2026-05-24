import { Elysia } from 'elysia';

import { userService } from '@/modules/user/service';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/user/model';
import { none } from '@/lib/util';

export const userRoutes = new Elysia({ name: 'User.Routes', prefix: '/users' })
  .use(loadAuthContext)
  .get('/me', ({ user }) => user, {
    response: model.userWithProfile,
    body: none
  })
  .delete('/me', async ({ user }) => await userService.deleteUser(user), {
    response: model.userWithProfile,
    body: none
  })
  .patch(
    '/me',
    async ({ user, body }) => await userService.update({ payload: body, user }),
    { response: model.userWithProfile, body: model.payload }
  )
  .post(
    '/set-password',
    async ({ request: { headers }, body }) =>
      await userService.setPassword({
        password: body.password as string,
        headers
      }),
    { response: model.payload, body: model.payload }
  )
  .post(
    '/verify-password',
    async ({ request: { headers }, body }) =>
      await userService.verifyPassword({
        password: body.password as string,
        headers
      }),
    { response: model.payload, body: model.payload }
  );
