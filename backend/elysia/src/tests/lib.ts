import { beforeEach, afterAll } from 'bun:test';
import { treaty } from '@elysia/eden';
import bcrypt from 'bcryptjs';

import type { RequireFields, Model } from '@/modules/task/model';

import { prisma } from '@/utils/prisma';
import { app } from '@/server';

export const api = treaty(app);

export const user = {
  email: 'arsalanansariofficial@outlook.com',
  name: 'Arsalan Ansari',
  password: '#Secret123'
};

export const task: RequireFields<Model['task'], 'status' | 'title'> = {
  description: 'Start learning JavaScript from mdn docs.',
  title: 'Learn JavaScript',
  status: 'incomplete'
};

export function setUpTests() {
  beforeEach(async () => {
    await cleanDb();
    await prisma.user.create({
      data: { ...user, password: await bcrypt.hash(user.password, 8) }
    });
  });

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  });
}

export async function login() {
  const { response } = await api.users.login.post({
    password: user.password,
    email: user.email
  });

  return response.headers.get('set-cookie');
}

async function cleanDb() {
  return await prisma.$transaction([
    prisma.userProfile.deleteMany(),
    prisma.token.deleteMany(),
    prisma.task.deleteMany(),
    prisma.user.deleteMany()
  ]);
}
