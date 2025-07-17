import { User } from 'next-auth';
import { PrismaClient } from '@prisma/client';

import { auth } from '@/auth';
import Component from '@/app/dashboard/component';
import { ChartConfig } from '@/components/ui/chart';
import { CARDS_DATA, CHARTS_DATA } from '@/lib/constants';

const prisma = new PrismaClient();

const chartConfig = {
  users: { label: 'Users', color: 'var(--primary)' }
} satisfies ChartConfig;

export default async function Page() {
  const session = await auth();

  const users = await prisma.user.findMany();

  return (
    <Component
      key={users.length}
      cardsData={CARDS_DATA}
      chartData={CHARTS_DATA}
      chartConfig={chartConfig}
      user={session?.user as User}
      users={users.filter(user => user.email !== session?.user?.email)}
    />
  );
}
