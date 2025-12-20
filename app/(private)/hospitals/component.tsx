'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Hospital, User as PrismaUser } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { User } from 'next-auth';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import MultiSelect from '@/components/ui/multi-select';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  verifyEmail,
  updateHospital,
  deleteHospital,
  deleteHospitals
} from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { hospitalSchema } from '@/lib/schemas';
import { capitalize, catchErrors, getDate, hasPermission } from '@/lib/utils';

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
              toast.promise(deleteHospital(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting hospital',
                position: 'top-center',
                success: MESSAGES.HOSPITAL.DELETED
              });
            }

            if (isHeader) {
              toast.promise(deleteHospitals(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting users',
                position: 'top-center',
                success: MESSAGES.HOSPITAL.BULK_DELETED
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
  users: PrismaUser[];
}) {
  const isMobile = useIsMobile();
  const form = useForm({
    defaultValues: {
      address: props.item.address,
      city: props.item.city,
      doctors: props.item.doctors.map((d: PrismaUser) => d.id),
      email: props.item.email,
      isAffiliated: props.item.isAffiliated ? 'yes' : 'no',
      name: props.item.name,
      phone: props.item.phone
    },
    resolver: zodResolver(hospitalSchema)
  });

  const { handleSubmit } = useHookForm(
    handler,
    updateHospital.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>
  );

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant='link' className='text-foreground px-0 capitalize'>
          {props.item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='capitalize'>{props.item.name}</DrawerTitle>
          <DrawerDescription>
            Change the details for the selected hospital
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            id='hospital-form'
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-2 overflow-y-auto p-4 text-sm'
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
                      value={field.value}
                      className='capitalize'
                      placeholder='Gwen Tennyson'
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
                      value={field.value}
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
              name='phone'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type='tel' placeholder='+919876543210' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='city'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='text'
                      value={field.value}
                      className='capitalize'
                      placeholder='Moradabad'
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
              name='isAffiliated'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliated</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
            <FormField
              name='address'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='123 Main Street, Springfield, IL 62704'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='doctors'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Users</FormLabel>
                  <FormControl>
                    <MultiSelect
                      selectedValues={field.value}
                      setSelectedValues={field.onChange}
                      options={props.users.map(u => ({
                        label: u.name || String(),
                        value: u.id
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DrawerFooter>
          <Button
            type='submit'
            disabled={form.formState.isLoading}
            form='hospital-form'
            className='cursor-pointer'
          >
            {form.formState.isLoading ? 'Saving...' : 'Save'}
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
  hospitals: Hospital[];
}) {
  const columns = useMemo<
    ColumnDef<{
      id: number;
      name: string;
      email: string;
      header: string;
      createdAt: string;
      city: string | null;
      users: PrismaUser[];
      isAffiliated: boolean;
    }>[]
  >(
    () => [
      {
        cell: ({ row }) => <DragHandle id={row.original.id} />,
        id: 'drag'
      },
      {
        cell: ({ row }) => (
          <Checkbox
            aria-label='Select row'
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
          />
        ),
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
        id: 'select'
      },
      {
        accessorKey: 'name',
        cell: ({ row }) => (
          <TableCellViewer
            key={Date.now()}
            users={props.users}
            item={props.hospitals.find(h => h.email === row.original.email)}
          />
        ),
        enableHiding: false,
        header: 'Name'
      },
      {
        accessorKey: 'email',
        cell: ({ row }) => (
          <Badge variant='outline' className='text-muted-foreground'>
            {row.original.email}
          </Badge>
        ),
        header: 'Email'
      },
      {
        accessorKey: 'isAffiliated',
        cell: ({ row }) => (
          <Switch
            disabled
            className='mx-auto block'
            checked={
              props.hospitals.find(
                hospital => row.original.isAffiliated === hospital.isAffiliated
              )?.isAffiliated
                ? true
                : false
            }
            onCheckedChange={async () =>
              toast.promise(verifyEmail(row.original.email), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Verifying Email',
                position: 'top-center',
                success: 'Done'
              })
            }
          />
        ),
        header: () => <div className='flex justify-center'>Affliated</div>
      },
      {
        accessorKey: 'city',
        cell: ({ row }) => capitalize(row.original.city || String()),
        header: () => <div>City</div>
      },
      {
        accessorKey: 'createdAt',
        cell: ({ row }) => getDate(row.original.createdAt),
        header: () => <div>Created At</div>
      },
      {
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
        },
        id: 'actions'
      }
    ],
    [props.hospitals, props.users]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          data={props.hospitals}
          columns={columns}
          filterConfig={[
            { id: 'name', placeholder: 'Name...' },
            { id: 'city', placeholder: 'City...' },
            { id: 'email', placeholder: 'Email...' }
          ]}
        />
      )}
      <Footer />
    </div>
  );
}
