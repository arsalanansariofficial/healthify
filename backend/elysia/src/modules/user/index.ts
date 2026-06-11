import { Elysia } from 'elysia';

import { userService } from '@/modules/user/service';
import { payload } from '@/modules/user/payload';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/user/model';

export const userRoutes = new Elysia({ name: 'User.Routes', prefix: '/users' })
  .use(loadAuthContext)
  .get('/me', ({ user }) => user, { response: model.userWithProfile })
  .patch(
    '/me',
    async ({ user, body }) => await userService.update({ payload: body, user }),
    { response: model.userWithProfile, body: payload.userProfile }
  )
  .post(
    '/set-password',
    async ({ body: { newPassword }, request: { headers } }) =>
      await userService.setPassword({ newPassword, headers }),
    { body: payload.setPassword, response: payload.status }
  )
  .post(
    '/verify-password',
    async ({ request: { headers }, body: { password } }) =>
      await userService.verifyPassword({ password, headers }),
    { body: payload.verifyPassword, response: payload.status }
  );
