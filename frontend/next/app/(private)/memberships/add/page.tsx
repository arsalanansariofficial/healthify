import { notFound } from 'next/navigation';

import Component from '@/app/(private)/memberships/add/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';

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
