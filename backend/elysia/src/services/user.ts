import type { Cookie } from 'elysia/cookies';

import bcrypt from 'bcryptjs';

import type { loginPayload, UserPayload } from '@/types/user';

import { InvalidCredentialsError } from '@/errors/errors';
import { generateToken, verifyToken } from '@/lib/token';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';

export async function authenticate(
  user: {
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    name: string;
    id: string;
  },
  jwt: Cookie<unknown> | undefined
) {
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

export async function login(
  { password, email }: loginPayload,
  jwt?: Cookie<unknown>
) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new InvalidCredentialsError();

  return await authenticate(user, jwt);
}

export async function create(payload: UserPayload, jwt?: Cookie<unknown>) {
  const user = await prisma.user.create({
    data: { ...payload, password: await bcrypt.hash(payload.password, 8) },
    omit: { password: true }
  });

  return await authenticate(user, jwt);
}

export async function logoutAll(token?: Cookie<unknown>) {
  const { id } = verifyToken(token?.value as string);
  await prisma.token.deleteMany({ where: { userId: id } });
  token?.remove();
  return { message: 'All sessions has been revoked.', success: true };
}

export async function logout(token?: Cookie<unknown>) {
  verifyToken(token?.value as string);
  await prisma.token.delete({ where: { token: token?.value as string } });
  token?.remove();
  return { message: 'User has been logged out.', success: true };
}

export async function get(token?: Cookie<unknown>) {
  verifyToken(token?.value as string);
  return await prisma.user.findMany({ omit: { password: true } });
}
