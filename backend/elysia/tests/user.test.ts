import { beforeEach, afterAll, expect, test } from 'bun:test';
import { HttpStatusCode } from 'axios';

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

  const { status, data } = await api.users.me.patch(
    { image: Bun.file('tests/fixtures/images/image.png') as unknown as File },
    getSessionCookie(headers)
  );

  const user = await prisma.user.findUnique({
    include: { profile: true },
    where: { id: data?.id }
  });

  expect(user?.profile?.image).not.toBe(null);
  expect(status).toBe(HttpStatusCode.Ok);
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
  const name = 'Max Tennyson';
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { ...ben }
  });

  const { status, data } = await api.users.me.patch(
    { name },
    getSessionCookie(headers)
  );

  const user = await prisma.user.findUnique({ where: { id: data?.id } });
  expect(user?.name).toBe(name.toLocaleLowerCase());
  expect(status).toBe(HttpStatusCode.Ok);
});

test('should not update invalid user fields', async () => {
  const { status, data } = await axiosClient.patch<Error>('/users/me', {
    name: 1,
    age: 1
  });

  expect(status).toBe(HttpStatusCode.UnprocessableEntity);
  expect(data.message).toBeDefined();
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

  const { status } = await api.users.me.delete(
    undefined,
    getSessionCookie(headers)
  );

  expect(status).toBe(HttpStatusCode.Ok);
});

test('should not get profile for unauthenticated user', async () => {
  const { status } = await api.users.me.get();
  expect(status).toBe(HttpStatusCode.Unauthorized);
});

test('should not delete account for unauthenticated user', async () => {
  const { status } = await api.users.me.delete();
  expect(status).toBe(HttpStatusCode.Unauthorized);
});
