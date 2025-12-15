import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { DOCTOR_ROLE } from '@/lib/constants';
import Component from '@/app/(private)/memberships/add/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  return (
    <Component
      doctors={await prisma.user.findMany({
        where: { UserRoles: { some: { role: { name: DOCTOR_ROLE } } } }
      })}
    />
  );
}
