import { notFound } from 'next/navigation';

import Component from '@/app/(private)/memberships/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const memberships = await prisma.membership.findMany({
    include: {
      fees: true,
      hospitalMemberships: { include: { hospital: true } }
    }
  });

  return (
    <Component
      key={memberships.map(c => c.updatedAt).toString()}
      memberships={memberships}
      user={session.user}
    />
  );
}
