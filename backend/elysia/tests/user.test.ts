import { beforeEach, afterAll, expect, test } from 'bun:test';
import { treaty } from '@elysia/eden';

import { setupDb, kevin, gwen, ben } from '~/tests/fixtures/db';
import { generateToken } from '@/utils/token';
import { prisma } from '@/utils/prisma';
import { app } from '@/server';

beforeEach(setupDb);

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

const api = treaty(app);

test('should upload profile picture for a user', async () => {
  const { status, data } = await api.users.me.patch(
    {
      imageUrl: new File(
        [await Bun.file('tests/fixtures/assets/image.png').arrayBuffer()],
        'image.png',
        { type: 'image/png' }
      )
    },
    { headers: { Cookie: `jwt=${generateToken(gwen.id as string)}` } }
  );

  const user = await prisma.user.findUnique({
    include: { profile: true },
    where: { id: data?.id }
  });

  expect(user?.profile).not.toBe(null);
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
    { headers: { Cookie: `jwt=${generateToken(ben.id as string)}` } }
  );

  const user = await prisma.user.findUnique({ where: { id: data?.id } });
  expect(user?.name).toBe(name.toLocaleLowerCase());
  expect(status).toBe(200);
});

test('should not login a non existing user', async () => {
  const { status } = await api.users.login.post({
    password: 'Invalid.Password@123',
    email: 'non.existing@cn.com'
  });

  expect(status).toBe(400);
});

test('should get profile for a user', async () => {
  const token = generateToken(gwen.id as string);

  const { status } = await api.users.me.get({
    headers: { Cookie: `jwt=${token}` }
  });

  expect(status).toBe(200);
});

test('should delete account for authenticated user', async () => {
  const { status } = await api.users.me.delete(null, {
    headers: { Cookie: `jwt=${generateToken(kevin.id as string)}` }
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
