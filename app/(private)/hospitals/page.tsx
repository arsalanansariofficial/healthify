import { notFound } from 'next/navigation';

import Component from '@/app/(private)/hospitals/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const [hospitals, departments, memberships, users] = await Promise.all([
    prisma.hospital.findMany({
      include: {
        doctors: true,
        hospitalDepartments: true,
        hospitalMemberships: true
      }
    }),
    prisma.department.findMany(),
    prisma.membership.findMany(),
    prisma.user.findMany({
      where: { UserRoles: { some: { role: { name: ROLES.DOCTOR as string } } } }
    })
  ]);

  return (
    <Component
      departments={departments}
      hospitals={hospitals}
      key={hospitals.map(h => h.updatedAt).toString()}
      memberships={memberships}
      user={session.user}
      users={users}
    />
  );
}
