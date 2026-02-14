import { Elysia } from 'elysia';

import { removeAuth, setAuth, auth } from '@/utils/auth';
import * as service from '@/modules/user/service';
import { model } from '@/modules/user/model';

const router = new Elysia({ name: 'User.Router', prefix: '/users' });

router.group('', { response: model.userProfileResponse }, app =>
  app
    .use(setAuth)
    .post('/', async ({ body }) => await service.create(body), {
      body: model.userRequest
    })
    .post('/login', async ({ body }) => await service.login(body), {
      body: model.loginRequest
    })
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
