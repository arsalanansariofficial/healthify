import { User } from 'next-auth';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import Chart from '@/components/chart';
import Footer from '@/components/footer';
import {
  Card,
  CardTitle,
  CardAction,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import {
  getDashboardCards,
  getMonthlyUserData,
  getUserDashboardCards,
  getMonthlyAppointmentData
} from '@/lib/actions';
import prisma from '@/lib/prisma';
import { hasPermission } from '@/lib/utils';

export default async function Page() {
  const session = await auth();
  if (!session?.user) notFound();
  const user = session?.user as User;

  const [allUsers, cardsData, chartData, userCardsData, userChartData] =
    await Promise.all([
      prisma.user.findMany(),
      getDashboardCards(),
      getMonthlyUserData(),
      getUserDashboardCards(session?.user?.id as string),
      getMonthlyAppointmentData(session.user.id as string)
    ]);

  const users = allUsers.filter(user => user.email !== session?.user?.email);

  return (
    <div
      className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'
      key={users.length}>
      {hasPermission(user.permissions, 'view:stats-cards') && (
        <section className='@container/main'>
          <div className='grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2'>
            {cardsData.map((card, index) => (
              <Card className='@container/card' key={index}>
                <CardHeader>
                  <CardDescription>{card.description}</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {card.title}
                  </CardTitle>
                  <CardAction>{card.action}</CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 max-w-11/12 gap-2 truncate font-medium'>
                    {card.subtitle}
                  </div>
                  <div className='text-muted-foreground'>{card.summary}</div>
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
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              Total visitors this year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              chartConfig={{
                users: { color: 'var(--primary)', label: 'Users' }
              }}
              className='max-h-80 w-full'
              data={chartData}
              dataKey='users'
            />
          </CardContent>
        </Card>
      )}
      {hasPermission(user.permissions, 'view:stats-cards:user') && (
        <section className='@container/main'>
          <div className='grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2'>
            {userCardsData.map((card, index) => (
              <Card className='@container/card' key={index}>
                <CardHeader>
                  <CardDescription>{card.description}</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {card.title}
                  </CardTitle>
                  <CardAction>{card.action}</CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    {card.subtitle}
                  </div>
                  <div className='text-muted-foreground'>{card.summary}</div>
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
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              Total appointments this year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              chartConfig={{
                appointments: { color: 'var(--primary)', label: 'Appointments' }
              }}
              className='max-h-80 w-full'
              data={userChartData}
              dataKey='appointments'
            />
          </CardContent>
        </Card>
      )}
      <Footer />
    </div>
  );
}
