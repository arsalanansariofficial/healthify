import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from './component';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
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
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
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
