'use client';

import z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useActionState, useState } from 'react';
import { User as PrismaUser } from '@prisma/client';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { User } from 'next-auth';
import * as actions from '@/lib/actions';
import { DoctorProps } from '@/lib/types';
import * as CN from '@/components/ui/card';
import * as CNC from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as Chart from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import * as Drawer from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import * as Select from '@/components/ui/select';
import { hasPermission, hasRole } from '@/lib/utils';
import { DoctorForm, useDoctorForm } from '@/app/doctors/add/component';

type TCVProps<T extends z.ZodType> = {
  item: z.infer<T>;
  chartConfig: CNC.ChartConfig;
  chartData: { month: string; users: number }[];
};

type Props = {
  user: User;
  users: PrismaUser[];
  chartConfig: CNC.ChartConfig;
  specialities: DoctorProps['specialities'];
  chartData: { month: string; users: number }[];
  cardsData: {
    title: string;
    action: string;
    summary: string;
    subtitle: string;
    description: string;
  }[];
};

export function TableCellViewer<T extends z.ZodType>(props: TCVProps<T>) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [emailVerified, setEmailVerified] = useState<string>(
    props.item.emailVerified ? 'yes' : 'no'
  );

  const [state, action, pending] = useActionState(
    async function (prevState: unknown, formData: FormData) {
      formData.set('verified', emailVerified);
      const result = await actions.updateUser(
        props.item.id,
        prevState,
        formData
      );

      if (result?.success) {
        toast(result.message, {
          position: 'top-center',
          onAutoClose: router.refresh,
          description: (
            <span className="text-foreground">
              {new Date().toLocaleString('en-US', {
                hour12: true,
                month: 'long',
                day: '2-digit',
                weekday: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          )
        });
      }

      if (!result?.success && result?.message) {
        toast(<h2 className="text-destructive">{result?.message}</h2>, {
          position: 'top-center',
          description: (
            <p className="text-destructive">
              {new Date().toLocaleString('en-US', {
                hour12: true,
                month: 'long',
                day: '2-digit',
                weekday: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )
        });
      }

      return result;
    },
    {
      name: props.item.name,
      email: props.item.email,
      emailVerfied: props.item.emailVerified
    } as actions.FormState
  );

  return (
    <Drawer.Drawer direction={isMobile ? 'bottom' : 'right'}>
      <Drawer.DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant="link" className="text-foreground px-0">
          {state?.name}
        </Button>
      </Drawer.DrawerTrigger>
      <Drawer.DrawerContent>
        <Drawer.DrawerHeader className="gap-1">
          <Drawer.DrawerTitle>Users Chart</Drawer.DrawerTitle>
          <Drawer.DrawerDescription>
            Showing total users for the last 6 months
          </Drawer.DrawerDescription>
        </Drawer.DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <Chart.ChartContainer config={props.chartConfig}>
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
                <Bar radius={4} dataKey="users" fill="var(--color-blue-500)" />
              </BarChart>
            </Chart.ChartContainer>
          )}
          <form id="user-form" className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={state?.name}
                placeholder="Gwen Tennyson"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={state?.email}
                placeholder="your.name@domain.com"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Secret@123"
                defaultValue={state?.password}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="verified">Email Verified</Label>
              <Select.Select
                onValueChange={setEmailVerified}
                defaultValue={emailVerified}
              >
                <Select.SelectTrigger id="verified" className="w-full">
                  <Select.SelectValue placeholder="Select a status" />
                </Select.SelectTrigger>
                <Select.SelectContent>
                  <Select.SelectItem value="no">No</Select.SelectItem>
                  <Select.SelectItem value="yes">Yes</Select.SelectItem>
                </Select.SelectContent>
              </Select.Select>
            </div>
          </form>
        </div>
        <Drawer.DrawerFooter>
          <Button
            type="submit"
            form="user-form"
            disabled={pending}
            formAction={action}
            className="cursor-pointer"
          >
            {pending ? 'Saving...' : 'Save'}
          </Button>
          <Drawer.DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </Drawer.DrawerClose>
        </Drawer.DrawerFooter>
      </Drawer.DrawerContent>
    </Drawer.Drawer>
  );
}

export default function Component(props: Props) {
  const doctorForm = useDoctorForm();

  return (
    <div className="col-span-2 space-y-4 lg:col-start-2">
      {hasPermission(props.user.roles, 'view:stats-cards') && (
        <section className="@container/main space-y-4">
          <header>
            <CN.Card>
              <CN.CardContent>
                <h1 className="font-semibold">Dashboard</h1>
              </CN.CardContent>
            </CN.Card>
          </header>
          <main className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
          </main>
        </section>
      )}
      {hasPermission(props.user.roles, 'view:stats') && (
        <section className="space-y-4">
          <header>
            <CN.Card>
              <CN.CardContent>
                <h1 className="font-semibold">Stats</h1>
              </CN.CardContent>
            </CN.Card>
          </header>
          <main>
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
          </main>
        </section>
      )}
      {hasRole(props.user.roles, 'doctor') && (
        <section className="space-y-4">
          <header>
            <CN.Card>
              <CN.CardContent>
                <h1 className="font-semibold">Profile</h1>
              </CN.CardContent>
            </CN.Card>
          </header>
          <main>
            <CN.Card>
              <CN.CardHeader>
                <CN.CardTitle>{props.user.name}</CN.CardTitle>
                <CN.CardDescription>
                  Update your profile. Click save when you are done.
                </CN.CardDescription>
              </CN.CardHeader>
              <CN.CardContent>
                <DoctorForm
                  image={doctorForm.image}
                  state={doctorForm.state}
                  gender={doctorForm.gender}
                  timings={doctorForm.timings}
                  imageSrc={doctorForm.imageSrc}
                  setImage={doctorForm.setImage}
                  setGender={doctorForm.setGender}
                  specialities={props.specialities}
                  setTimings={doctorForm.setTimings}
                  setImageSrc={doctorForm.setImageSrc}
                  selectedDays={doctorForm.selectedDays}
                  setSelectedDays={doctorForm.setSelectedDays}
                  selectedSpecialities={doctorForm.selectedSpecialities}
                  setSelectedSpecialities={doctorForm.setSelectedSpecialities}
                />
              </CN.CardContent>
              <CN.CardFooter>
                <Button
                  type="submit"
                  form="doctor-form"
                  disabled={doctorForm.pending}
                  formAction={doctorForm.action}
                >
                  {doctorForm.pending ? 'Saving...' : 'Save'}
                </Button>
              </CN.CardFooter>
            </CN.Card>
          </main>
        </section>
      )}
    </div>
  );
}
