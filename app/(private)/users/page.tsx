import { User } from 'next-auth';

import Component from '@/app/(private)/users/component';
import { auth } from '@/auth';
import { ChartConfig } from '@/components/ui/chart';
import { getDashboardCards, getMonthlyUserData } from '@/lib/actions';
import prisma from '@/lib/prisma';

const chartConfig = {
  users: { color: 'var(--primary)', label: 'Users' }
} satisfies ChartConfig;

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
      chartData={chartsData}
      chartConfig={chartConfig}
      user={session?.user as User}
      key={users.map(u => u.updatedAt).toString()}
      users={users.filter(user => user.email !== session?.user?.email)}
    />
  );
}
