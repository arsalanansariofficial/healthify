'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { User as PrismaUser } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { User } from 'next-auth';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Chart from '@/components/chart';
import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartConfig } from '@/components/ui/chart';
import { Checkbox } from '@/components/ui/checkbox';
import { DragHandle, DataTable } from '@/components/ui/data-table';
import {
  Drawer,
  DrawerClose,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  deleteUser,
  updateUser,
  deleteUsers,
  verifyEmail
} from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { userSchema } from '@/lib/schemas';
import { catchErrors, hasPermission } from '@/lib/utils';

type yesNo = 'yes' | 'no';

function Menu({
  id,
  ids,
  isHeader = false
}: {
  id?: string;
  ids?: string[];
  isHeader: boolean;
}) {
  const menuTrigger = (
    <DropdownMenuTrigger asChild>
      <Button
        className='data-[state=open]:bg-muted text-muted-foreground flex size-8'
        size='icon'
        variant='ghost'
      >
        <IconDotsVertical />
        <span className='sr-only'>Open menu</span>
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {!isHeader && menuTrigger}
      {ids && ids.length > 0 && isHeader && menuTrigger}
      <DropdownMenuContent align='end' className='w-32'>
        <DropdownMenuItem
          onClick={async () => {
            if (!isHeader)
              toast.promise(deleteUser(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting user',
                position: 'top-center',
                success: MESSAGES.USER.DELETED
              });

            if (isHeader)
              toast.promise(deleteUsers(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting users',
                position: 'top-center',
                success: MESSAGES.USER.BULK_DELETED
              });
          }}
          variant='destructive'
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableCellViewer(props: {
  item: PrismaUser;
  chartConfig: ChartConfig;
  chartData: { month: string; users: number }[];
}) {
  const isMobile = useIsMobile();
  const form = useForm({ resolver: zodResolver(userSchema) });

  const { handleSubmit, pending } = useHookForm(
    handler,
    updateUser.bind(null, props.item.id) as (data: unknown) => Promise<unknown>
  );

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button className='text-foreground px-0 capitalize' variant='link'>
          {props.item.id.slice(-5)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='gap-1'>
          <DrawerTitle>Users Chart</DrawerTitle>
          <DrawerDescription>
            Showing total users for the last 6 months
          </DrawerDescription>
        </DrawerHeader>
        <div className='flex flex-col gap-4 overflow-y-auto px-4 text-sm'>
          {!isMobile && (
            <Chart
              chartConfig={props.chartConfig}
              data={props.chartData}
              dataKey='users'
            />
          )}
          <Form {...form}>
            <form
              className='space-y-2'
              id='user-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='capitalize'
                        placeholder='Gwen Tennyson'
                        type='text'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='your.name@domain.com'
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Secret@123'
                        type='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                defaultValue={props.item.emailVerified ? 'yes' : 'no'}
                name='emailVerified'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Verified</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value as yesNo}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='no'>No</SelectItem>
                          <SelectItem value='yes'>Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DrawerFooter>
          <Button
            className='cursor-pointer'
            disabled={pending}
            form='user-form'
            type='submit'
          >
            {pending ? 'Saving...' : 'Save'}
          </Button>
          <DrawerClose asChild>
            <Button variant='outline'>Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function Component(props: {
  user: User;
  users: PrismaUser[];
  chartConfig: ChartConfig;
  chartData: { month: string; users: number }[];
  cardsData: {
    title: string;
    action: string;
    summary: string;
    subtitle: string;
    description: string;
  }[];
}) {
  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          button={
            <Button asChild>
              <Link href='/users/add'>Add</Link>
            </Button>
          }
          columns={
            [
              {
                cell: ({ row }) => <DragHandle id={row.original.id} />,
                id: 'drag'
              },
              {
                cell: ({ row }) => (
                  <Checkbox
                    aria-label='Select row'
                    checked={row.getIsSelected()}
                    onCheckedChange={value =>
                      row.toggleSelected(Boolean(value))
                    }
                  />
                ),
                enableHiding: false,
                enableSorting: false,
                header: ({ table }) => (
                  <Checkbox
                    aria-label='Select all'
                    checked={
                      table.getIsAllPageRowsSelected() ||
                      (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={value =>
                      table.toggleAllPageRowsSelected(Boolean(value))
                    }
                  />
                ),
                id: 'select'
              },
              {
                accessorKey: 'id',
                cell: ({ row }) => (
                  <TableCellViewer
                    chartConfig={props.chartConfig}
                    chartData={props.chartData}
                    item={row.original}
                    key={Date.now()}
                  />
                ),
                enableHiding: false,
                header: 'Id'
              },
              {
                accessorKey: 'name',
                cell: ({ row }) => (
                  <span className='capitalize'>{row.original.name}</span>
                ),
                enableHiding: false,
                header: 'Name'
              },
              {
                accessorKey: 'email',
                cell: ({ row }) => (
                  <Badge className='text-muted-foreground' variant='outline'>
                    {row.original.email}
                  </Badge>
                ),
                header: 'Email'
              },
              {
                accessorKey: 'emailVerified',
                cell: ({ row }) => (
                  <Switch
                    checked={Boolean(
                      props.users.find(
                        user => row.original.email === user.email
                      )?.emailVerified
                    )}
                    className='mx-auto block'
                    id='verify-email'
                    onCheckedChange={async () =>
                      toast.promise(
                        verifyEmail(row.original.email || String()),
                        {
                          error(error) {
                            const { message } = catchErrors(error as Error);
                            return (
                              <span className='text-destructive'>
                                {message}
                              </span>
                            );
                          },
                          loading: 'Verifying Email',
                          position: 'top-center',
                          success: 'Done'
                        }
                      )
                    }
                  />
                ),
                header: () => (
                  <div className='flex justify-center'>Email Verified</div>
                )
              },
              {
                cell: ({ row }) => (
                  <Menu id={row.original.id.toString()} isHeader={false} />
                ),
                header: ({ table }) => (
                  <Menu
                    ids={table
                      .getSelectedRowModel()
                      .rows.map(r => r.original.id.toString())}
                    isHeader={true}
                  />
                ),
                id: 'actions'
              }
            ] as ColumnDef<PrismaUser>[]
          }
          data={props.users}
          filterConfig={[
            { id: 'name', placeholder: 'Name...' },
            { id: 'email', placeholder: 'Email...' }
          ]}
        />
      )}
      <Footer />
    </div>
  );
}
