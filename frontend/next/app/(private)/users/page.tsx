import { User } from 'next-auth';

import Component from '@/app/(private)/users/component';
import { auth } from '@/auth';
import { getDashboardCards, getMonthlyUserData } from '@/lib/actions';
import prisma from '@/lib/prisma';

export default async function Page() {
  const [session, users, cardsData, chartsData] = await Promise.all([
    auth(),
    prisma.user.findMany(),
    getDashboardCards(),
    getMonthlyUserData()
  ]);

  return (
    <Component
      cardsData={cardsData}
      chartConfig={{ users: { color: 'var(--primary)', label: 'Users' } }}
      chartData={chartsData}
      key={users.map(u => u.updatedAt).toString()}
      user={session?.user as User}
      users={users.filter(user => user.email !== session?.user?.email)}
    />
  );
}
