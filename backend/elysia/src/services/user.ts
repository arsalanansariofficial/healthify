import type { Cookie } from 'elysia/cookies';

import bcrypt from 'bcryptjs';

import type { UserPayload, User } from '@/types/user';

import { usersResponseSchema, userResponseSchema } from '@/schemas/user';
import { generateToken, verifyToken } from '@/lib/token';
import { tokens, users } from '@/db/db';
import { env } from '@/config/env';

export async function create(payload: UserPayload, jwt?: Cookie<unknown>) {
  const user: User = {
    ...payload,
    password: await bcrypt.hash(payload.password, 8),
    id: crypto.randomUUID(),
    updatedAt: new Date(),
    createdAt: new Date()
  };

  const token = generateToken(user.id);

  setTimeout(
    () =>
      tokens.splice(
        tokens.findIndex(token => token.id === user.id),
        1
      ),
    3000
  );

  tokens.push({ id: user.id, jwt: token });
  users.push(user);

  jwt?.set({
    secure: env.NODE_ENV === 'PRODUCTION',
    maxAge: env.JWT_EXPIRES_IN / 1000,
    sameSite: 'lax',
    httpOnly: true,
    value: token,
    path: '/'
  });

  return userResponseSchema.parse(user);
}

export async function get(token?: Cookie<unknown>) {
  verifyToken(token?.value as string);
  return usersResponseSchema.parse(users);
}
