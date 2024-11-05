'use client';

import z from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { User as PrismaUser } from '@prisma/client';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { User } from '@/lib/types';
import * as CN from '@/components/ui/card';
import * as RT from '@tanstack/react-table';
import * as CNC from '@/components/ui/chart';
import * as Icons from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import * as Chart from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import * as Drawer from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import * as DT from '@/components/ui/data-table';
import * as Select from '@/components/ui/select';
import * as DM from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { deleteUser, deleteUsers, verifyEmail } from '@/lib/actions';

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
  chartData: { month: string; users: number }[];
  cardsData: {
    title: string;
    action: string;
    summary: string;
    subtitle: string;
    description: string;
  }[];
};

type MenuProps = {
  id?: string;
  ids?: string[];
  isHeader: boolean;
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
              toast.promise(deleteUser(id as string), {
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
              toast.promise(deleteUsers(ids as string[]), {
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
  const { item } = props;
  const isMobile = useIsMobile();

  return (
    <Drawer.Drawer direction={isMobile ? 'bottom' : 'right'}>
      <Drawer.DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant="link" className="text-foreground px-0">
          {item.name}
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
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue={item.name}
                placeholder="Gwen Tennyson"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                defaultValue={item.email}
                placeholder="your.name@domain.com"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="has-email-verified">Status</Label>
              <Select.Select defaultValue={item.emailVerified ? 'Yes' : 'No'}>
                <Select.SelectTrigger
                  className="w-full"
                  id="has-email-verified"
                >
                  <Select.SelectValue placeholder="Select a status" />
                </Select.SelectTrigger>
                <Select.SelectContent>
                  <Select.SelectItem value="No">No</Select.SelectItem>
                  <Select.SelectItem value="Yes">Yes</Select.SelectItem>
                </Select.SelectContent>
              </Select.Select>
            </div>
          </form>
        </div>
        <Drawer.DrawerFooter>
          <Button>Submit</Button>
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
          item={row.original}
          chartData={props.chartData}
          chartConfig={props.chartConfig}
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
            toast.promise(verifyEmail(row.original.email), {
              error: 'Error',
              success: 'Done',
              position: 'top-center',
              loading: 'Updating Email'
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
    <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
      <aside className="sticky top-[7.35em] hidden h-[90%] max-h-[50em] min-w-[10em] overflow-y-auto lg:block">
        <CN.Card className="h-full">
          <CN.CardContent className="space-y-4">
            <div className="space-y-2">
              <Link
                href="/docs"
                className="text-muted-foreground block text-xs font-semibold"
              >
                Docs
              </Link>
              <ul>
                <li>
                  <Link href="/dashboard" className="font-semibold">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/lifecycle" className="font-semibold">
                    Lifecycle
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="font-semibold">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="font-semibold">
                    Teams
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <Link
                href="/components"
                className="text-muted-foreground block text-xs font-semibold"
              >
                Components
              </Link>
              <ul>
                <li>
                  <Link href="/data-library" className="font-semibold">
                    Data Library
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="font-semibold">
                    Reports
                  </Link>
                </li>
              </ul>
            </div>
          </CN.CardContent>
        </CN.Card>
      </aside>
      <div className="col-span-2 space-y-4 lg:col-start-2">
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
        <section>
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
        </section>
        <section>
          <DT.DataTable data={props.users} columns={columns} />
        </section>
      </div>
    </main>
  );
}
