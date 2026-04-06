import { Elysia } from 'elysia';

import { removeAuth, setAuth, auth } from '@/lib/auth';
import * as service from '@/modules/user/service';
import { model } from '@/modules/user/model';
import { none } from '@/lib/util/types';

const publicRoutes = new Elysia({ name: 'User.Routes.Public' })
  .use(setAuth)
  .post('/', async ({ body }) => await service.create(body), {
    response: model.userWithProfileAndToken,
    body: model.userPayload
  })
  .post('/login', async ({ body }) => await service.login(body), {
    response: model.userWithProfileAndToken,
    body: model.loginPayload
  });

const privateRoutes = new Elysia({ name: 'User.Routes.Private' })
  .use(auth)
  .get('/me', ({ user }) => user, {
    response: model.userWithProfileAndToken,
    body: none
  })
  .delete('/me', async ({ user }) => await service.deleteUser(user.id), {
    response: model.userWithProfileAndToken,
    body: none
  })
  .patch(
    '/me',
    async ({ user, body }) => await service.update({ payload: body, user }),
    { response: model.userWithProfileAndToken, body: model.userProfilePayload }
  )
  .use(removeAuth)
  .post(
    '/logout',
    async ({ cookie: { jwt } }) => await service.logout(jwt.value),
    { response: model.success, body: none }
  )
  .post(
    '/logout/all',
    async ({ cookie: { jwt } }) => await service.logoutAll(jwt.value),
    { response: model.success, body: none }
  );

export default new Elysia({ name: 'User.Routes', prefix: '/users' })
  .use(privateRoutes)
  .use(publicRoutes);
