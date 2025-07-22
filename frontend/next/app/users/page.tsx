import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/users/component';
import { ChartConfig } from '@/components/ui/chart';
import { getDashboardCards, getMonthlyUserData } from '@/lib/actions';

const chartConfig = {
  users: { label: 'Users', color: 'var(--primary)' }
} satisfies ChartConfig;

export default async function Page() {
  const session = await auth();
  const users = await prisma.user.findMany();
  const cardsData = await getDashboardCards();
  const chartsData = await getMonthlyUserData();

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header user={session?.user as User} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          cardsData={cardsData}
          chartData={chartsData}
          chartConfig={chartConfig}
          user={session?.user as User}
          key={users.map(u => u.updatedAt).toString()}
          users={users.filter(user => user.email !== session?.user?.email)}
        />
      </main>
    </Session>
  );
}
