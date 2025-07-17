'use client';

import z from 'zod';
import { toast } from 'sonner';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { User as PrismaUser } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import * as actions from '@/lib/actions';
import { DoctorProps } from '@/lib/types';
import * as CN from '@/components/ui/card';
import { userSchema } from '@/lib/schemas';
import * as RT from '@tanstack/react-table';
import * as RHF from '@/components/ui/form';
import { hasPermission } from '@/lib/utils';
import * as CNC from '@/components/ui/chart';
import * as Icons from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Chart from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import useHookForm from '@/hooks/use-hook-form';
import * as Drawer from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import * as DT from '@/components/ui/data-table';
import * as Select from '@/components/ui/select';
import handler from '@/components/display-toast';
import * as DM from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

type MenuProps = { id?: string; ids?: string[]; isHeader: boolean };

type TCVProps<T extends z.ZodType> = {
  item: z.infer<T>;
  chartConfig: CNC.ChartConfig;
  chartData: { month: string; users: number }[];
};

type TableSchema = {
  id: number;
  name: string;
  email: string;
  header: string;
  createdAt: string;
  emailVerified: string;
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

function Menu({ id, ids, isHeader = false }: MenuProps) {
  const menuTrigger = (
    <DM.DropdownMenuTrigger asChild>
      <Button
        size="icon"
        variant="ghost"
        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
      >
        <Icons.IconDotsVertical />
        <span className="sr-only">Open menu</span>
      </Button>
    </DM.DropdownMenuTrigger>
  );

  return (
    <DM.DropdownMenu>
      {!isHeader && menuTrigger}
      {ids && ids.length > 0 && isHeader && menuTrigger}
      <DM.DropdownMenuContent align="end" className="w-32">
        <DM.DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            if (!isHeader) {
              toast.promise(actions.deleteUser(id as string), {
                position: 'top-center',
                loading: 'Deleting user',
                success: '🎉 User deleted successfully.',
                error: (
                  <span className="text-destructive">
                    ⚠️ Something went wrong!
                  </span>
                )
              });
            }

            if (isHeader) {
              toast.promise(actions.deleteUsers(ids as string[]), {
                position: 'top-center',
                loading: 'Deleting users',
                success: '🎉 Users deleted successfully.',
                error: (
                  <span className="text-destructive">
                    ⚠️ Something went wrong!
                  </span>
                )
              });
            }
          }}
        >
          Delete
        </DM.DropdownMenuItem>
      </DM.DropdownMenuContent>
    </DM.DropdownMenu>
  );
}

export function TableCellViewer<T extends z.ZodType>(props: TCVProps<T>) {
  const isMobile = useIsMobile();
  const form = useForm({ resolver: zodResolver(userSchema) });

  const { pending, handleSubmit } = useHookForm(
    handler,
    actions.updateUser.bind(null, props.item.id) as (
      data: z.infer<typeof userSchema>
    ) => Promise<actions.FormState | undefined>
  );

  return (
    <Drawer.Drawer direction={isMobile ? 'bottom' : 'right'}>
      <Drawer.DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant="link" className="text-foreground px-0">
          {props.item.name}
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
          <RHF.Form {...form}>
            <form
              id="user-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Name</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Gwen Tennyson"
                        value={field.value ?? String()}
                        onChange={({ target: { value } }) =>
                          field.onChange(value || undefined)
                        }
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Email</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="email"
                        value={field.value ?? String()}
                        placeholder="your.name@domain.com"
                        onChange={({ target: { value } }) =>
                          field.onChange(value || undefined)
                        }
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Password</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Secret@123"
                        value={field.value ?? String()}
                        onChange={({ target: { value } }) =>
                          field.onChange(value || undefined)
                        }
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="emailVerified"
                control={form.control}
                defaultValue={props.item.emailVerified ? 'yes' : 'no'}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Email Verified</RHF.FormLabel>
                    <RHF.FormControl>
                      <Select.Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.SelectTrigger className="w-full">
                          <Select.SelectValue placeholder="Select a status" />
                        </Select.SelectTrigger>
                        <Select.SelectContent>
                          <Select.SelectItem value="no">No</Select.SelectItem>
                          <Select.SelectItem value="yes">Yes</Select.SelectItem>
                        </Select.SelectContent>
                      </Select.Select>
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
            </form>
          </RHF.Form>
        </div>
        <Drawer.DrawerFooter>
          <Button
            type="submit"
            form="user-form"
            disabled={pending}
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
  function getEmailChecked(email: string) {
    const user = props.users.find(user => email === user.email);
    return user?.emailVerified ? true : false;
  }

  const columns: RT.ColumnDef<TableSchema>[] = [
    {
      id: 'drag',
      cell: ({ row }) => <DT.DragHandle id={row.original.id} />
    },
    {
      id: 'select',
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
        />
      )
    },
    {
      header: 'Name',
      enableHiding: false,
      accessorKey: 'name',
      cell: ({ row }) => (
        <TableCellViewer
          key={Date.now()}
          chartData={props.chartData}
          chartConfig={props.chartConfig}
          item={props.users.find(u => u.email === row.original.email)}
        />
      )
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground">
          {row.original.email}
        </Badge>
      )
    },
    {
      header: () => <div className="flex justify-center">Email Verified</div>,
      accessorKey: 'emailVerified',
      cell: ({ row }) => (
        <Switch
          id="verify-email"
          className="mx-auto block"
          checked={getEmailChecked(row.original.email)}
          onCheckedChange={async () =>
            toast.promise(actions.verifyEmail(row.original.email), {
              error: 'Error',
              success: 'Done',
              position: 'top-center',
              loading: 'Verifying Email'
            })
          }
        />
      )
    },
    {
      accessorKey: 'createdAt',
      header: () => <div>Created At</div>,
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString('en-us', {
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Menu isHeader={false} id={row.original.id.toString()} />
      ),
      header: ({ table }) => {
        return (
          <Menu
            isHeader={true}
            ids={table
              .getSelectedRowModel()
              .rows.map(r => r.original.id.toString())}
          />
        );
      }
    }
  ];

  return (
    <div className="col-span-2 space-y-4 lg:col-start-2">
      {hasPermission(props.user.roles, 'view:users') && (
        <section className="space-y-4">
          <header>
            <CN.Card>
              <CN.CardContent>
                <h1 className="font-semibold">Users</h1>
              </CN.CardContent>
            </CN.Card>
          </header>
          <main>
            <CN.Card>
              <CN.CardContent>
                <DT.DataTable
                  data={props.users}
                  columns={columns}
                  filterConfig={[
                    { id: 'name', placeholder: 'Name...' },
                    { id: 'email', placeholder: 'Email...' }
                  ]}
                />
              </CN.CardContent>
            </CN.Card>
          </main>
        </section>
      )}
    </div>
  );
}
