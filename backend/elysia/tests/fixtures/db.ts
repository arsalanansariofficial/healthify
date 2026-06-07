import { mkdir, rm } from 'node:fs/promises';
import { treaty } from '@elysia/eden';
import path from 'node:path';
import axios from 'axios';

import { prisma } from '@/lib/prisma';
import { env } from '@/lib/config';
import { auth } from '@/lib/auth';
import { app } from '@/server';

export const ben = {
  tasks: [
    {
      title: 'Learn about SwampFire',
      status: 'incomplete' as const,
      id: crypto.randomUUID()
    }
  ],
  password: 'Ben.Tennyson@123',
  name: 'Ben Tennyson',
  email: 'ben@cn.com'
};

export const gwen = {
  tasks: [
    {
      status: 'incomplete' as const,
      title: 'Meet Charm Caster',
      id: crypto.randomUUID()
    }
  ],
  password: 'Gwen.Tennyson@123',
  name: 'Gwen Tennyson',
  email: 'gwen@cn.com'
};

export const kevin = {
  tasks: [
    {
      status: 'complete' as const,
      id: crypto.randomUUID(),
      title: 'Stop aggregor'
    }
  ],
  password: 'Kevin.Eleven@123',
  name: 'Kevin Ethan Leven',
  email: 'kevin@cn.com'
};

export const unknown = {
  tasks: [
    {
      title: 'Learn about SwampFire',
      status: 'incomplete' as const,
      id: crypto.randomUUID()
    }
  ],
  password: 'Unknown.Password@123',
  email: 'unknown@cn.com',
  name: 'Ben Tennyson'
};

export const axiosClient = axios.create({
  timeout: env.AXIOS_REQUEST_TIMEOUT,
  validateStatus: undefined,
  baseURL: env.BASE_URL
});

export const api = treaty(app);

export async function setupDb() {
  await Promise.all([resetDb(), resetDisk()]);

  const [$ben, $gwen, $kevin] = await Promise.all([
    auth.api.signUpEmail({ body: { ...ben } }),
    auth.api.signUpEmail({ body: { ...gwen } }),
    auth.api.signUpEmail({ body: { ...kevin } })
  ]);

  await prisma.$transaction([
    prisma.task.createMany({
      data: ben.tasks.map(t => ({ ...t, userId: $ben.user.id }))
    }),
    prisma.task.createMany({
      data: gwen.tasks.map(t => ({ ...t, userId: $gwen.user.id }))
    }),
    prisma.task.createMany({
      data: kevin.tasks.map(t => ({ ...t, userId: $kevin.user.id }))
    })
  ]);
}

export async function resetDb() {
  await prisma.$transaction([
    prisma.verification.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.task.deleteMany(),
    prisma.user.deleteMany()
  ]);
}

export async function resetDisk() {
  await rm(env.UPLOAD_DIR, { recursive: true, force: true });
  await mkdir(path.dirname(env.UPLOAD_DIR), { recursive: true });
  await Bun.write(`${env.UPLOAD_DIR}/.gitkeep`, String());
}

export function getSessionCookie(headers: Headers) {
  return { headers: { cookie: headers.getSetCookie() } };
}
