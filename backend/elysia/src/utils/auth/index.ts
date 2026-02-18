import { Elysia } from 'elysia';

import { type Model, model } from '@/modules/user/model';
import { InvalidCredentialsError } from '@/utils/error';
import { verifyToken } from '@/utils/token';
import { prisma } from '@/utils/prisma';
import { env } from '@/utils/config';

export const auth = new Elysia({ name: 'Auth.Plugin' })
  .guard({ cookie: model.jwt.required() })
  .resolve(async ({ cookie: { jwt } }) => {
    const { id } = verifyToken(jwt.value);
    const user = await prisma.user.findUnique({
      include: { profile: true, tokens: true },
      omit: { password: true },
      where: { id }
    });

    if (!user) throw new InvalidCredentialsError();
    return { jwt: jwt.value, user };
  })
  .as('scoped');

export const setAuth = new Elysia({ name: 'Auth.SetPlugin' })
  .guard({ cookie: model.jwt })
  .onAfterHandle(({ cookie: { jwt }, responseValue }) => {
    if (
      responseValue instanceof Object &&
      'tokens' in responseValue &&
      Array.isArray(responseValue.tokens)
    ) {
      const [{ token }] = responseValue.tokens as [Model['token']];
      jwt.set({
        secure: env.NODE_ENV === 'production',
        maxAge: env.JWT_EXPIRES_IN / 1000,
        sameSite: 'lax',
        httpOnly: true,
        value: token,
        path: '/'
      });
    }
  })
  .as('scoped');

export const removeAuth = new Elysia({ name: 'Auth.UnsetPlugin' })
  .guard({ cookie: model.jwt.required() })
  .onAfterHandle(({ cookie: { jwt }, responseValue }) => {
    if (
      responseValue instanceof Object &&
      'success' in responseValue &&
      responseValue.success
    )
      jwt.remove();
  })
  .as('scoped');
