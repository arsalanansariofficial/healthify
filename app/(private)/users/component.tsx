'use client';

import z from 'zod';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { ColumnDef } from '@tanstack/react-table';
import { User as PrismaUser } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconDotsVertical } from '@tabler/icons-react';

import Chart from '@/components/chart';
import Footer from '@/components/footer';
import { userSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import handler from '@/components/display-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ChartConfig } from '@/components/ui/chart';
import { MESSAGES } from '@/lib/constants';
import { catchErrors, getDate, hasPermission } from '@/lib/utils';
import { DragHandle, DataTable } from '@/components/ui/data-table';

import {
  deleteUser,
  updateUser,
  deleteUsers,
  verifyEmail
} from '@/lib/actions';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form';

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu';

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
        size='icon'
        variant='ghost'
        className='data-[state=open]:bg-muted text-muted-foreground flex size-8'
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
          variant='destructive'
          onClick={async () => {
            if (!isHeader) {
              toast.promise(deleteUser(id as string), {
                position: 'top-center',
                loading: 'Deleting user',
                success: MESSAGES.USER.DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                }
              });
            }

            if (isHeader) {
              toast.promise(deleteUsers(ids as string[]), {
                position: 'top-center',
                loading: 'Deleting users',
                success: MESSAGES.USER.BULK_DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                }
              });
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableCellViewer<T extends z.ZodType>(props: {
  item: z.infer<T>;
  chartConfig: ChartConfig;
  chartData: { month: string; users: number }[];
}) {
  const isMobile = useIsMobile();
  const form = useForm({ resolver: zodResolver(userSchema) });

  const { pending, handleSubmit } = useHookForm(
    handler,
    updateUser.bind(null, props.item.id) as (data: unknown) => Promise<unknown>
  );

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant='link' className='text-foreground px-0'>
          {props.item.name}
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
              dataKey='users'
              data={props.chartData}
              chartConfig={props.chartConfig}
            />
          )}
          <Form {...form}>
            <form
              id='user-form'
              className='space-y-2'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name='name'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder='Gwen Tennyson'
                        value={field.value ?? String()}
                        onChange={({ target: { value } }) =>
                          field.onChange(value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='email'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        value={field.value ?? String()}
                        placeholder='your.name@domain.com'
                        onChange={({ target: { value } }) =>
                          field.onChange(value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder='Secret@123'
                        value={field.value ?? String()}
                        onChange={({ target: { value } }) =>
                          field.onChange(value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='emailVerified'
                control={form.control}
                defaultValue={props.item.emailVerified ? 'yes' : 'no'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Verified</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
            type='submit'
            form='user-form'
            disabled={pending}
            className='cursor-pointer'
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
  const columns = useMemo<
    ColumnDef<{
      id: number;
      name: string;
      email: string;
      header: string;
      createdAt: string;
      emailVerified: string;
    }>[]
  >(
    () => [
      {
        id: 'drag',
        cell: ({ row }) => <DragHandle id={row.original.id} />
      },
      {
        id: 'select',
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            aria-label='Select all'
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label='Select row'
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
          <Badge variant='outline' className='text-muted-foreground'>
            {row.original.email}
          </Badge>
        )
      },
      {
        header: () => <div className='flex justify-center'>Email Verified</div>,
        accessorKey: 'emailVerified',
        cell: ({ row }) => (
          <Switch
            id='verify-email'
            className='mx-auto block'
            checked={
              props.users.find(user => row.original.email === user.email)
                ?.emailVerified
                ? true
                : false
            }
            onCheckedChange={async () =>
              toast.promise(verifyEmail(row.original.email), {
                success: 'Done',
                position: 'top-center',
                loading: 'Verifying Email',
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                }
              })
            }
          />
        )
      },
      {
        accessorKey: 'createdAt',
        header: () => <div>Created At</div>,
        cell: ({ row }) => getDate(row.original.createdAt)
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
    ],
    [props.chartConfig, props.chartData, props.users]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          data={props.users}
          columns={columns}
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
