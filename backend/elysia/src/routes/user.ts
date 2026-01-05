import { Elysia } from 'elysia';

import {
  usersResponseSchema,
  userResponseSchema,
  userPayloadSchema
} from '@/schemas/user';
import * as userService from '@/services/user';
import { jwtSchema } from '@/schemas/cookie';

const router = new Elysia({ prefix: '/users', name: 'user' });

router.post(
  '/',
  async ({ cookie: { jwt }, body }) => await userService.create(body, jwt),
  { response: userResponseSchema, body: userPayloadSchema, cookie: jwtSchema }
);

router.get('/', async ({ cookie: { jwt } }) => await userService.get(jwt), {
  response: usersResponseSchema,
  cookie: jwtSchema
});

export default router;
