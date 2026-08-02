import { mkdir, rm } from 'node:fs/promises';
import { treaty } from '@elysia/eden';
import path from 'node:path';

import { prisma } from '@/lib/prisma';
import { env } from '@/lib/config';
import { ctx } from '@/lib/auth';
import { app } from '@/server';

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

export const ben = {
  password: 'Ben.Tennyson@123',
  id: crypto.randomUUID(),
  name: 'Ben Tennyson',
  email: 'ben@cn.com'
};

export const gwen = {
  password: 'Gwen.Tennyson@123',
  id: crypto.randomUUID(),
  name: 'Gwen Tennyson',
  email: 'gwen@cn.com'
};

export const kevin = {
  password: 'Kevin.Eleven@123',
  name: 'Kevin Ethan Leven',
  id: crypto.randomUUID(),
  email: 'kevin@cn.com'
};

export const bensTasks = [
  {
    title: 'Learn about SwampFire',
    status: 'incomplete' as const,
    id: crypto.randomUUID(),
    userId: ben.id
  }
];

export const gwensTasks = [
  {
    status: 'incomplete' as const,
    title: 'Meet Charm Caster',
    id: crypto.randomUUID(),
    userId: gwen.id
  }
];

export const kevinsTasks = [
  {
    status: 'complete' as const,
    id: crypto.randomUUID(),
    title: 'Stop aggregor',
    userId: kevin.id
  }
];

export const api = treaty(app);

export async function resetDb() {
  await prisma.$transaction(async prisma => {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');

    const tables = await prisma.$queryRaw<{ TABLE_NAME: string }[]>`
      select TABLE_NAME from information_schema.TABLES
      where TABLE_SCHEMA = database ()
    `;

    await Promise.all(
      tables.map(({ TABLE_NAME }) =>
        prisma.$executeRawUnsafe(`truncate table ${TABLE_NAME}`)
      )
    );

    await prisma.$executeRawUnsafe('set FOREIGN_KEY_CHECKS = 1');
  });
}

export async function setupDb() {
  await Promise.all([resetDb(), resetDisk()]);

  await Promise.all([
    ctx.saveUser(ctx.createUser(ben)),
    ctx.saveUser(ctx.createUser(gwen)),
    ctx.saveUser(ctx.createUser(kevin))
  ]);

  await prisma.$transaction([
    prisma.task.createMany({ data: bensTasks }),
    prisma.task.createMany({ data: gwensTasks }),
    prisma.task.createMany({ data: kevinsTasks })
  ]);
}

export async function resetDisk() {
  await rm(env.UPLOAD_DIR, { recursive: true, force: true });
  await mkdir(path.dirname(env.UPLOAD_DIR), { recursive: true });
  await Bun.write(`${env.UPLOAD_DIR}/.gitkeep`, String());
}

export function getSessionCookie(headers: Headers) {
  return { headers: { cookie: headers.get('cookie') } };
}
