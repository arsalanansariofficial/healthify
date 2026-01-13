import type { Cookie } from 'elysia/cookies';

import bcrypt from 'bcryptjs';

import type { UserPayload } from '@/types/user';

import { generateToken, verifyToken } from '@/lib/token';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';

export async function create(payload: UserPayload, jwt?: Cookie<unknown>) {
  const user = await prisma.user.create({
    data: { ...payload, password: await bcrypt.hash(payload.password, 8) },
    omit: { password: true }
  });

  const { token } = await prisma.token.create({
    data: { token: generateToken(user.id), userId: user.id },
    select: { token: true }
  });

  setTimeout(
    async () => await prisma.token.delete({ where: { token } }),
    env.JWT_EXPIRES_IN
  );

  jwt?.set({
    secure: env.NODE_ENV === 'PRODUCTION',
    maxAge: env.JWT_EXPIRES_IN / 1000,
    sameSite: 'lax',
    httpOnly: true,
    value: token,
    path: '/'
  });

  return user;
}

export async function get(token?: Cookie<unknown>) {
  verifyToken(token?.value as string);
  return await prisma.user.findMany({ omit: { password: true } });
}
