import { notFound } from 'next/navigation';

import Component from '@/app/(private)/subscriptions/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const subscriptions = await prisma.membershipSubscription.findMany({
    include: {
      fee: true,
      membership: {
        include: { hospitalMemberships: { include: { hospital: true } } }
      },
      transactions: true,
      user: true
    },
    orderBy: { transactions: { _count: 'desc' } }
  });

  return (
    <Component
      key={subscriptions.map(s => s.updatedAt).toString()}
      subscriptions={subscriptions}
      user={session.user}
    />
  );
}
