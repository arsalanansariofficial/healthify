import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/subscriptions/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const subscriptions = await prisma.membershipSubscription.findMany({
    orderBy: { transactions: { _count: 'desc' } },
    include: {
      fee: true,
      user: true,
      transactions: true,
      membership: {
        include: { hospitalMemberships: { include: { hospital: true } } }
      }
    }
  });

  return (
    <Component
      user={session.user}
      subscriptions={subscriptions}
      key={subscriptions.map(s => s.updatedAt).toString()}
    />
  );
}
