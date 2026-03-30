import { beforeEach, afterAll, expect, test } from 'bun:test';
import { HttpStatusCode } from 'axios';

import {
  axiosClient,
  cleanupDb,
  setupDb,
  kevin,
  gwen,
  ben,
  api
} from '@/tests/fixtures/db';
import { generateToken } from '@/lib/token';
import { prisma } from '@/lib/prisma';

beforeEach(setupDb);
afterAll(cleanupDb);

test('should upload profile picture for a user', async () => {
  const { status, data } = await api.users.me.patch(
    {
      imageUrl: Bun.file('tests/fixtures/images/image.png') as unknown as File
    },
    { headers: { Cookie: `jwt=${generateToken(gwen.id)}` } }
  );

  const user = await prisma.user.findUnique({
    include: { profile: true },
    where: { id: data?.id }
  });

  expect(user?.profile?.imageUrl).not.toBe(null);
  expect(status).toBe(200);
});

test('should signup a new user', async () => {
  const payload = {
    password: 'Charm.Caster@123',
    email: 'charm@cn.com',
    name: 'Charm Caster'
  };

  const { response, status, error, data } = await api.users.post(payload);
  const user = await prisma.user.findUnique({ where: { id: data?.id } });

  expect(response.headers.get('set-cookie')).toContain('jwt');
  expect(data).not.toBeNull();
  expect(user).not.toBeNull();
  expect(error).toBeNull();
  expect(status).toBe(200);
});

test('should login an existing user', async () => {
  const { response, status, data } = await api.users.login.post({
    password: gwen.password,
    email: gwen.email
  });

  const user = await prisma.user.findUnique({ where: { id: data?.id } });

  expect(response.headers.get('set-cookie')).toContain('jwt');
  expect(user).not.toBe(null);
  expect(status).toBe(200);
});

test('should update valid user fields', async () => {
  const name = 'Max Tennyson';
  const { status, data } = await api.users.me.patch(
    { name },
    { headers: { Cookie: `jwt=${generateToken(ben.id)}` } }
  );

  const user = await prisma.user.findUnique({ where: { id: data?.id } });
  expect(user?.name).toBe(name.toLocaleLowerCase());
  expect(status).toBe(200);
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
  const { status } = await api.users.login.post({
    password: 'Invalid.Password@123',
    email: 'non.existing@cn.com'
  });

  expect(status).toBe(400);
});

test('should get profile for a user', async () => {
  const { status } = await api.users.me.get({
    headers: { Cookie: `jwt=${generateToken(gwen.id)}` }
  });

  expect(status).toBe(200);
});

test('should delete account for authenticated user', async () => {
  const { status } = await api.users.me.delete(undefined, {
    headers: { Cookie: `jwt=${generateToken(kevin.id)}` }
  });

  expect(status).toBe(200);
});

test('should not get profile for unauthenticated user', async () => {
  const { status } = await api.users.me.get();
  expect(status).toBe(422);
});

test('should not delete account for unauthenticated user', async () => {
  const { status } = await api.users.me.delete();
  expect(status).toBe(422);
});
