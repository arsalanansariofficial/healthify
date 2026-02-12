import { Elysia } from 'elysia';

import { InvalidCredentialsError } from '@/utils/error';
import { model } from '@/modules/user/model';
import { verifyToken } from '@/utils/token';
import { prisma } from '@/utils/prisma';

export const auth = new Elysia({ name: 'Auth.SetPlugin' })
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
