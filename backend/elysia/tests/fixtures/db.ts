import type { User } from '~/generated/prisma/client';

import { hashPassword } from '@/utils/lib';
import { prisma } from '@/utils/prisma';

export let kevin: User;
export let gwen: User;
export let ben: User;

export async function setupDb() {
  const $ben = {
    tasks: {
      create: [
        { title: 'Learn about SwampFire', status: 'incomplete' as const }
      ]
    },
    password: 'Ben.Tennyson@123',
    name: 'Ben Tennyson',
    email: 'ben@cn.com'
  };

  const $gwen = {
    tasks: {
      create: [{ status: 'incomplete' as const, title: 'Meet Charm Caster' }]
    },
    password: 'Gwen.Tennyson@123',
    name: 'Gwen Tennyson',
    email: 'gwen@cn.com'
  };

  const $kevin = {
    tasks: {
      create: [{ status: 'complete' as const, title: 'Stop aggregor' }]
    },
    password: 'Kevin.Eleven@123',
    name: 'Kevin Ethan Leven',
    email: 'kevin@cn.com'
  };

  const [, ...rest] = await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.user.create({
      data: { ...$ben, password: await hashPassword($ben.password) },
      include: { tasks: true }
    }),
    prisma.user.create({
      data: { ...$gwen, password: await hashPassword($gwen.password) },
      include: { tasks: true }
    }),
    prisma.user.create({
      data: { ...$kevin, password: await hashPassword($kevin.password) },
      include: { tasks: true }
    })
  ]);

  [ben, gwen, kevin] = rest;
  ben.password = $ben.password;
  gwen.password = $gwen.password;
  kevin.password = $kevin.password;
}
