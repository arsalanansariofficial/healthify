import { notFound } from 'next/navigation';

import Component from '@/app/(private)/hospitals/add/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const [departments, memberships, users] = await Promise.all([
    prisma.department.findMany(),
    prisma.membership.findMany(),
    prisma.user.findMany({
      select: { id: true, name: true },
      where: { UserRoles: { some: { role: { name: ROLES.DOCTOR as string } } } }
    })
  ]);

  return (
    <Component
      departments={departments}
      memberships={memberships}
      users={users}
    />
  );
}
