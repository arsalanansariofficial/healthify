import { Elysia } from 'elysia';

import * as userService from '@/modules/user/service';
import { model } from '@/modules/user/model';
import { auth } from '@/utils/auth';

const router = new Elysia({ prefix: '/users', name: 'user' });

router.post(
  '/',
  async ({ cookie: { jwt }, body }) => await userService.create(body, jwt),
  { response: model.userResponse, body: model.userRequest, cookie: model.jwt }
);

router.post(
  '/login',
  async ({ cookie: { jwt }, body }) => await userService.login(body, jwt),
  { response: model.userResponse, body: model.loginRequest, cookie: model.jwt }
);

router
  .use(auth)
  .get('/', async () => await userService.get(), {
    response: model.usersResponse
  });

router.post(
  '/logout',
  async ({ cookie: { jwt } }) => await userService.logout(jwt),
  { response: model.logoutResponse }
);

router.post(
  '/logout/all',
  async ({ cookie: { jwt } }) => await userService.logoutAll(jwt),
  { response: model.logoutResponse }
);

export default router;
