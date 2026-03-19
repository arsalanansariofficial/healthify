import { Elysia } from 'elysia';

import { hasValidAuthentication, verifyToken, hasSuccess } from '@/utils/token';
import { loginUser } from '@/modules/user/service';
import { model } from '@/modules/user/model';
import { env } from '@/utils/config';

export const auth = new Elysia({ name: 'Auth.Plugin' })
  .guard({ cookie: model.jwt.required() })
  .resolve(async ({ cookie: { jwt } }) => {
    const { id } = verifyToken(jwt.value);
    const user = await loginUser(id);
    return { jwt: jwt.value, user };
  })
  .as('scoped');

export const setAuth = new Elysia({ name: 'Auth.SetPlugin' })
  .guard({ cookie: model.jwt })
  .onAfterHandle(({ cookie: { jwt }, responseValue }) => {
    if (hasValidAuthentication(responseValue))
      jwt.set({
        secure: env.NODE_ENV === 'production',
        value: responseValue.tokens[0].token,
        maxAge: env.JWT_EXPIRES_IN / 1000,
        sameSite: 'lax',
        httpOnly: true,
        path: '/'
      });
  })
  .as('scoped');

export const removeAuth = new Elysia({ name: 'Auth.UnsetPlugin' })
  .guard({ cookie: model.jwt.required() })
  .onAfterHandle(({ cookie: { jwt }, responseValue }) => {
    if (hasSuccess(responseValue)) jwt.remove();
  })
  .as('scoped');
