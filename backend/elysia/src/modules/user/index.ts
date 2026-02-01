import { Elysia } from 'elysia';

import * as userService from '@/modules/user/service';
import { model } from '@/modules/user/model';
import { auth } from '@/utils/auth';

const router = new Elysia({ prefix: '/users', name: 'user' });

router.group('', { cookie: model.jwt }, app =>
  app
    .post(
      '/',
      async ({ cookie: { jwt }, body }) => await userService.create(body, jwt),
      { response: model.userResponse, body: model.userRequest }
    )
    .post(
      '/login',
      async ({ cookie: { jwt }, body }) => await userService.login(body, jwt),
      { response: model.userResponse, body: model.loginRequest }
    )
);

router.group('', app =>
  app
    .use(auth)
    .get('/me', ({ user }) => user, { response: model.userProfileResponse })
    .delete('/me', async ({ user }) => await userService.deleteUser(user.id), {
      response: model.userResponse
    })
    .patch(
      '/me',
      async ({ user, body }) => await userService.update(user.id, body),
      { response: model.userProfileResponse, body: model.userProfileRequest }
    )
    .post(
      '/logout',
      async ({ cookie: { jwt } }) => await userService.logout(jwt),
      { response: model.logoutResponse }
    )
    .post(
      '/logout/all',
      async ({ cookie: { jwt } }) => await userService.logoutAll(jwt),
      { response: model.logoutResponse }
    )
);

export default router;
