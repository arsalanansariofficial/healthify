import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ROLES } from '@/lib/constants';
import Component from '@/app/(private)/memberships/add/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  return (
    <Component
      doctors={await prisma.user.findMany({
        where: {
          UserRoles: { some: { role: { name: ROLES.DOCTOR as string } } }
        }
      })}
    />
  );
}
