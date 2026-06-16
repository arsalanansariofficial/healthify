import { beforeEach, afterAll, expect, test } from 'bun:test';
import { HttpStatusCode } from 'axios';

import type { Payload } from '@/modules/user/payload';

import {
  getSessionCookie,
  axiosClient,
  resetDisk,
  setupDb,
  resetDb,
  unknown,
  gwen,
  api,
  ben
} from '@/tests/fixtures/db';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/config';
import { auth } from '@/lib/auth';

afterAll(async () => {
  await Promise.all([resetDb(), resetDisk()]);
  await prisma.$disconnect();
});
beforeEach(setupDb);

test('should upload profile picture for a user', async () => {
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...gwen }
  });

  const fd = new FormData();
  fd.append('user.image', Bun.file('tests/fixtures/images/image.png'));

  const { status, data } = await axiosClient.patch(
    '/users/me',
    fd,
    getSessionCookie(headers)
  );

  const user = await prisma.user.findUnique({ where: { id: data?.id } });

  expect(status).toBe(HttpStatusCode.Ok);
  expect(user?.image).toBeString();
  expect(user?.image).toBeTruthy();
});

test('should signup a new user', async () => {
  const payload = {
    password: 'Charm.Caster@123',
    email: 'charm@cn.com',
    name: 'Charm Caster'
  };

  const { token, user } = await auth.api.signUpEmail({ body: payload });
  expect(token).not.toBeNull();
  expect(user).not.toBeNull();

  const userFromDb = await prisma.user.findUnique({ where: { id: user.id } });
  expect(userFromDb?.email).toBe(payload.email);
  expect(userFromDb).not.toBeNull();
});

test('should login an existing user', async () => {
  const { token, user } = await auth.api.signInEmail({ body: { ...gwen } });
  expect(user).not.toBe(null);
  expect(token).not.toBe(null);

  const userFromDb = await prisma.user.findUnique({ where: { id: user.id } });
  expect(userFromDb).not.toBe(null);
});

test('should update valid user fields', async () => {
  const bio = 'Max Tennyson';
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...ben }
  });

  const { status, data } = await api.users.me.patch(
    { profile: { bio } },
    getSessionCookie(headers)
  );

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: data?.id }
  });
  expect(userProfile?.bio).toBe(bio.toLocaleLowerCase());
  expect(status).toBe(HttpStatusCode.Ok);
});

test('should not update invalid user fields', async () => {
  const { status } = await api.users.me.patch({
    profile: { age: 1 },
    user: { name: 1 }
  } as unknown as Payload['userWithProfile']);

  expect(status).toBe(HttpStatusCode.UnprocessableEntity);
});

test('should not login a non existing user', async () => {
  expect(auth.api.signInEmail({ body: unknown })).rejects.toThrowError(
    'Invalid email or password'
  );
});

test('should get profile for a user', async () => {
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...ben }
  });

  const { status } = await api.users.me.get(getSessionCookie(headers));

  expect(status).toBe(HttpStatusCode.Ok);
});

test('should delete account for authenticated user', async () => {
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...ben }
  });

  const { status } = await auth.handler(
    new Request(`${env.BETTER_AUTH_URL}/api/auth/delete-user`, {
      headers: {
        cookie: getSessionCookie(headers).headers.cookie?.toString(),
        'content-type': 'application/json'
      },
      body: JSON.stringify({}),
      method: 'post'
    })
  );

  expect(status).toBe(HttpStatusCode.Ok);
});

test('should not get profile for unauthenticated user', async () => {
  const { status } = await api.users.me.get();
  expect(status).toBe(HttpStatusCode.Unauthorized);
});

test('should not delete account for unauthenticated user', async () => {
  const { status } = await auth.handler(
    new Request(`${env.BETTER_AUTH_URL}/api/auth/delete-user`, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
      method: 'post'
    })
  );
  expect(status).toBe(HttpStatusCode.Unauthorized);
});
