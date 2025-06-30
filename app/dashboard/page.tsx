import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

import { auth } from '@/auth';
import Component from '@/app/dashboard/component';
import { ChartConfig } from '@/components/ui/chart';

const prisma = new PrismaClient();

const chartConfig = {
  users: { label: 'Users', color: 'var(--primary)' }
} satisfies ChartConfig;

const chartsData = [
  { month: 'January', users: 186 },
  { month: 'February', users: 305 },
  { month: 'March', users: 237 },
  { month: 'April', users: 73 },
  { month: 'May', users: 209 },
  { month: 'June', users: 214 }
];

const cardsData = [
  {
    action: '+12.5%',
    title: '$1,250.00',
    description: 'Total Revenue',
    subtitle: 'Trending up this month',
    summary: 'Visitors for the last 6 months'
  },
  {
    action: '-20%',
    title: '1,234',
    description: 'New Customers',
    subtitle: 'Down 20% this period',
    summary: 'Acquisition needs attention'
  },
  {
    action: '+12.5%',
    title: '45,678',
    description: 'Active Accounts',
    subtitle: 'Strong user retention',
    summary: 'Engagement exceed targets'
  },
  {
    title: '4.5%',
    action: '+4.5%',
    description: 'Growth Rate',
    subtitle: 'Steady performance increase',
    summary: 'Meets growth projections'
  }
];

export default async function Page() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { roles: { include: { permissions: true } } }
  });

  if (!user) redirect('/login');

  const users = await prisma.user.findMany();

  return (
    <Component
      user={user}
      key={users.length}
      cardsData={cardsData}
      chartData={chartsData}
      chartConfig={chartConfig}
      users={users.filter(user => user.email !== session?.user?.email)}
    />
  );
}
