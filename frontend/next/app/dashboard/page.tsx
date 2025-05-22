import { User } from 'next-auth';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from './component';
import * as utils from '@/lib/actions';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { ChartConfig } from '@/components/ui/chart';
import { hasRole } from '@/lib/utils';
import { ADMIN_ROLE } from '@/lib/constants';

const chartConfig = {
  users: { label: 'Users', color: 'var(--primary)' }
} satisfies ChartConfig;

const userChartConfig = {
  appointments: { label: 'Appointments', color: 'var(--primary)' }
} satisfies ChartConfig;

export default async function Page() {
  const session = await auth();
  if (!session?.user) notFound();

  const isAdmin = hasRole(session.user.roles, ADMIN_ROLE);
  const users = isAdmin ? await prisma.user.findMany() : [];

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          key={users.length}
          chartConfig={chartConfig}
          user={session?.user as User}
          userChartConfig={userChartConfig}
          cardsData={isAdmin ? await utils.getDashboardCards() : []}
          chartData={isAdmin ? await utils.getMonthlyUserData() : []}
          users={users.filter(user => user.email !== session?.user?.email)}
          userCardsData={
            !isAdmin
              ? await utils.getUserDashboardCards(session?.user?.id as string)
              : []
          }
          userChartData={
            !isAdmin
              ? await utils.getMonthlyAppointmentData(session.user.id as string)
              : []
          }
        />
      </main>
    </Session>
  );
}
