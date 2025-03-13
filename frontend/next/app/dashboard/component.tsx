'use client';

import { User } from 'next-auth';
import { User as PrismaUser } from '@prisma/client';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import Footer from '@/components/footer';
import * as CN from '@/components/ui/card';
import Sidebar from '@/components/sidebar';
import { hasPermission } from '@/lib/utils';
import * as CNC from '@/components/ui/chart';

type Props = {
  user: User;
  users: PrismaUser[];
  chartConfig: CNC.ChartConfig;
  chartData: { month: string; users: number }[];
  cardsData: {
    title: string;
    action: string;
    summary: string;
    subtitle: string;
    description: string;
  }[];
};

export default function Component(props: Props) {
  return (
    <div className="grid h-full xl:grid-cols-[1fr_auto] xl:gap-12">
      <section className="flex flex-col gap-8 lg:mx-auto lg:w-10/12">
        {hasPermission(props.user.permissions, 'view:stats-cards') && (
          <section className="@container/main">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2">
              {props.cardsData.map((card, index) => (
                <CN.Card key={index} className="@container/card">
                  <CN.CardHeader>
                    <CN.CardDescription>{card.description}</CN.CardDescription>
                    <CN.CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {card.title}
                    </CN.CardTitle>
                    <CN.CardAction>{card.action}</CN.CardAction>
                  </CN.CardHeader>
                  <CN.CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {card.subtitle}
                    </div>
                    <div className="text-muted-foreground">{card.summary}</div>
                  </CN.CardFooter>
                </CN.Card>
              ))}
            </div>
          </section>
        )}
        {hasPermission(props.user.permissions, 'view:stats') && (
          <CN.Card>
            <CN.CardHeader>
              <CN.CardDescription>Total Visitors</CN.CardDescription>
              <CN.CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                Total visitors for the last 3 months
              </CN.CardTitle>
            </CN.CardHeader>
            <CN.CardContent>
              <CNC.ChartContainer
                config={props.chartConfig}
                className="max-h-80 w-full"
              >
                <BarChart accessibilityLayer data={props.chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <CNC.ChartTooltip content={<CNC.ChartTooltipContent />} />
                  <CNC.ChartLegend
                    content={<CNC.ChartLegendContent payload={[]} />}
                  />
                  <Bar
                    radius={4}
                    dataKey="users"
                    fill="var(--color-blue-500)"
                  />
                </BarChart>
              </CNC.ChartContainer>
            </CN.CardContent>
          </CN.Card>
        )}
        <Footer />
      </section>
      <div className="hidden xl:block">
        <Sidebar user={props.user} />
      </div>
    </div>
  );
}
