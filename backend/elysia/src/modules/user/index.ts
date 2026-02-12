import { Elysia } from 'elysia';

import * as service from '@/modules/user/service';
import { removeAuth, auth } from '@/utils/auth';
import { model } from '@/modules/user/model';

const router = new Elysia({ name: 'User.Router', prefix: '/users' });

router.group('', { response: model.userResponse, cookie: model.jwt }, app =>
  app
    .post(
      '/',
      async ({ cookie: { jwt }, body }) => await service.create(body, jwt),
      { body: model.userRequest }
    )
    .post(
      '/login',
      async ({ cookie: { jwt }, body }) => await service.login(body, jwt),
      { body: model.loginRequest }
    )
);

router.group('', app =>
  app
    .use(auth)
    .get('/me', ({ user }) => user, { response: model.userProfileResponse })
    .delete('/me', async ({ user }) => await service.deleteUser(user.id), {
      response: model.userResponse
    })
    .patch(
      '/me',
      async ({ user, body }) => await service.update(user.id, body),
      { response: model.userProfileResponse, body: model.userProfileRequest }
    )
    .use(removeAuth)
    .post(
      '/logout',
      async ({ cookie: { jwt } }) => await service.logout(jwt.value),
      { response: model.logoutResponse }
    )
    .post(
      '/logout/all',
      async ({ cookie: { jwt } }) => await service.logoutAll(jwt.value),
      { response: model.logoutResponse }
    )
);

export default router;
