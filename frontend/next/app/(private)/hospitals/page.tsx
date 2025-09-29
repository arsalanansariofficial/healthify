import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ROLES } from '@/lib/constants';
import Component from '@/app/(private)/hospitals/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const hospitals = await prisma.hospital.findMany({
    include: { doctors: true }
  });

  return (
    <Component
      user={session.user}
      hospitals={hospitals}
      key={hospitals.map(h => h.updatedAt).toString()}
      users={await prisma.user.findMany({
        where: {
          UserRoles: { some: { role: { name: ROLES.DOCTOR as string } } }
        }
      })}
    />
  );
}
