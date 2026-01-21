import { Elysia } from 'elysia';

import {
  usersResponseSchema,
  userResponseSchema,
  loginPayloadSchema,
  userPayloadSchema
} from '@/schemas/user';
import { successResponseSchema } from '@/schemas/generic';
import * as userService from '@/services/user';
import { jwtSchema } from '@/schemas/cookie';

const router = new Elysia({ prefix: '/users', name: 'user' });

router.post(
  '/',
  async ({ cookie: { jwt }, body }) => await userService.create(body, jwt),
  { response: userResponseSchema, body: userPayloadSchema, cookie: jwtSchema }
);

router.post(
  '/login',
  async ({ cookie: { jwt }, body }) => await userService.login(body, jwt),
  { response: userResponseSchema, body: loginPayloadSchema, cookie: jwtSchema }
);

router.post(
  '/logout',
  async ({ cookie: { jwt } }) => await userService.logout(jwt),
  { response: successResponseSchema, cookie: jwtSchema }
);

router.post(
  '/logout/all',
  async ({ cookie: { jwt } }) => await userService.logoutAll(jwt),
  { response: successResponseSchema, cookie: jwtSchema }
);

router.get('/', async ({ cookie: { jwt } }) => await userService.get(jwt), {
  response: usersResponseSchema,
  cookie: jwtSchema
});

export default router;
