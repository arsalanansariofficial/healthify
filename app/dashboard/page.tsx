import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/dashboard/component';
import { ChartConfig } from '@/components/ui/chart';
import { CARDS_DATA, CHARTS_DATA } from '@/lib/constants';

const chartConfig = {
  users: { label: 'Users', color: 'var(--primary)' }
} satisfies ChartConfig;

export default async function Page() {
  const session = await auth();
  const users = await prisma.user.findMany();

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
        <Sidebar user={session?.user as User} />
        <Component
          key={users.length}
          cardsData={CARDS_DATA}
          chartData={CHARTS_DATA}
          chartConfig={chartConfig}
          user={session?.user as User}
          users={users.filter(user => user.email !== session?.user?.email)}
        />
      </main>
    </Session>
  );
}
