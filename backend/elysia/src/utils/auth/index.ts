import { Elysia } from 'elysia';
import z from 'zod';

import { InvalidCredentialsError } from '@/utils/error';
import { verifyToken } from '@/utils/token';
import { prisma } from '@/utils/prisma';

export const auth = new Elysia({ name: 'auth' })
  .guard({
    cookie: z.object({ jwt: z.jwt({ error: 'JWT should be valid.' }) })
  })
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
