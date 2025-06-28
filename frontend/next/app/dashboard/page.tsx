import { User } from 'next-auth';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import * as utils from '@/lib/actions';
import Chart from '@/components/chart';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { hasPermission } from '@/lib/utils';
import { ChartConfig } from '@/components/ui/chart';

import {
  Card,
  CardTitle,
  CardAction,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

const chartConfig = {
  users: { label: 'Users', color: 'var(--primary)' }
} satisfies ChartConfig;

const userChartConfig = {
  appointments: { label: 'Appointments', color: 'var(--primary)' }
} satisfies ChartConfig;

export default async function Page() {
  const session = await auth();
  if (!session?.user) notFound();

  const user = session?.user as User;
  const cardsData = await utils.getDashboardCards();
  const chartData = await utils.getMonthlyUserData();

  const users = (await prisma.user.findMany()).filter(
    user => user.email !== session?.user?.email
  );

  const userCardsData = await utils.getUserDashboardCards(
    session?.user?.id as string
  );

  const userChartData = await utils.getMonthlyAppointmentData(
    session.user.id as string
  );

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <div
          key={users.length}
          className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12"
        >
          {hasPermission(user.permissions, 'view:stats-cards') && (
            <section className="@container/main">
              <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2">
                {cardsData.map((card, index) => (
                  <Card key={index} className="@container/card">
                    <CardHeader>
                      <CardDescription>{card.description}</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {card.title}
                      </CardTitle>
                      <CardAction>{card.action}</CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 max-w-11/12 gap-2 truncate font-medium">
                        {card.subtitle}
                      </div>
                      <div className="text-muted-foreground">
                        {card.summary}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
          {hasPermission(user.permissions, 'view:stats') && (
            <Card>
              <CardHeader>
                <CardDescription>Total Visitors</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  Total visitors this year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  dataKey="users"
                  data={chartData}
                  className="max-h-80 w-full"
                  chartConfig={chartConfig}
                />
              </CardContent>
            </Card>
          )}
          {hasPermission(user.permissions, 'view:stats-cards:user') && (
            <section className="@container/main">
              <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2">
                {userCardsData.map((card, index) => (
                  <Card key={index} className="@container/card">
                    <CardHeader>
                      <CardDescription>{card.description}</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {card.title}
                      </CardTitle>
                      <CardAction>{card.action}</CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        {card.subtitle}
                      </div>
                      <div className="text-muted-foreground">
                        {card.summary}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
          {hasPermission(user.permissions, 'view:stats:user') && (
            <Card>
              <CardHeader>
                <CardDescription>Consultation</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  Total appointments this year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  dataKey="appointments"
                  data={userChartData}
                  className="max-h-80 w-full"
                  chartConfig={userChartConfig}
                />
              </CardContent>
            </Card>
          )}
          <Footer />
        </div>
      </main>
    </Session>
  );
}
