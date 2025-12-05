'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Signature, Trash } from 'lucide-react';
import { User } from 'next-auth';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DragHandle, DataTable } from '@/components/ui/data-table';
import {
  Drawer,
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
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  deleteMembership,
  deleteMemberships,
  updateMedicationForm
} from '@/lib/actions';
import { MESSAGES, ROLES } from '@/lib/constants';
import { membershipSchema } from '@/lib/schemas';
import { catchErrors, hasPermission, hasRole } from '@/lib/utils';

type Row = Prisma.MembershipGetPayload<{
  include: { fees: true; hospitalMemberships: true };
}>;

function Menu({
  id,
  ids,
  isAdmin = false,
  isHeader = false
}: {
  id?: string;
  ids?: string[];
  isHeader: boolean;
  user: User;
  isAdmin?: boolean;
}) {
  const menuTrigger = (
    <DropdownMenuTrigger asChild>
      <Button
        className='data-[state=open]:bg-muted text-muted-foreground flex size-8'
        size='icon'
        variant='ghost'>
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
        {isAdmin && (
          <DropdownMenuItem
            className='flex cursor-pointer items-center justify-between gap-1'
            onClick={async () => {
              if (!isHeader)
                toast.promise(deleteMembership(id as string), {
                  error(error) {
                    const { message } = catchErrors(error as Error);
                    return <span className='text-destructive'>{message}</span>;
                  },
                  loading: 'Deleting medication form',
                  position: 'top-center',
                  success: MESSAGES.MEMBERSHIP.DELETED
                });

              if (isHeader)
                toast.promise(deleteMemberships(ids as string[]), {
                  error(error) {
                    const { message } = catchErrors(error as Error);
                    return <span className='text-destructive'>{message}</span>;
                  },
                  loading: 'Deleting medication forms',
                  position: 'top-center',
                  success: MESSAGES.MEMBERSHIP.BULK_DELETED
                });
            }}
            variant='destructive'>
            <span>Delete</span>
            <Trash />
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className='flex cursor-pointer items-center justify-between gap-1'>
          <Link href={`/memberships/${id}/subscribe`}>Subscribe</Link>
          <Signature />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableCellViewer(props: { item: Row }) {
  const isMobile = useIsMobile();
  const form = useForm({
    defaultValues: {
      fees: [],
      hospitalMemberships: [],
      name: props.item.name,
      perks: props.item.perks
    },
    resolver: zodResolver(membershipSchema)
  });

  const { handleSubmit } = useHookForm(
    handler,
    updateMedicationForm.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>
  );

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button className='text-foreground px-0 capitalize' variant='link'>
          {props.item.id.slice(-5)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='capitalize'>{props.item.name}</DrawerTitle>
          <DrawerDescription>
            Change the details for the selected membership
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            className='space-y-2 overflow-y-auto p-4 text-sm'
            id='membership-form'
            onSubmit={form.handleSubmit(handleSubmit)}>
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
                      placeholder='Tablet'
                      type='text'
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
            className='cursor-pointer'
            disabled={form.formState.isLoading}
            form='membership-form'
            type='submit'>
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function Component(props: { user: User; memberships: Row[] }) {
  const isAdmin = hasRole(props.user.roles, ROLES.ADMIN as string);
  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:memberships') && (
        <DataTable
          button={
            <Button asChild>
              <Link href='/memberships/add'>Add</Link>
            </Button>
          }
          columns={
            [
              {
                cell: ({ row }) => <DragHandle id={row.original.id} />,
                id: 'drag'
              },
              {
                cell: ({ row }) =>
                  isAdmin && (
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
                header: ({ table }) =>
                  isAdmin && (
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
                  <TableCellViewer item={row.original} key={Date.now()} />
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
                accessorKey: 'perks',
                cell: ({ row }: { row: { original: { perks: string[] } } }) => (
                  <ul className='space-y-2'>
                    {row.original.perks.map((p, i) => (
                      <li key={i}>
                        <Badge variant='outline'>{p}</Badge>
                      </li>
                    ))}
                  </ul>
                ),
                enableHiding: false,
                header: 'Perks'
              },
              {
                accessorKey: 'hospitals',
                cell: ({
                  row
                }: {
                  row: {
                    original: {
                      hospitalMemberships: { hospital: { name: string } }[];
                    };
                  };
                }) => (
                  <ul className='space-y-2'>
                    {row.original.hospitalMemberships.map((hm, i) => (
                      <li key={i}>
                        <Badge className='capitalize'>{hm.hospital.name}</Badge>
                      </li>
                    ))}
                  </ul>
                ),
                enableHiding: false,
                header: 'Hospitals'
              },
              {
                accessorKey: 'fee',
                cell: ({ row }) => {
                  if (!row.original.fees.length) return <Badge>Free</Badge>;

                  return (
                    <ul className='space-y-2'>
                      {row.original.fees.map((f, i) => (
                        <li className='flex items-center gap-2' key={i}>
                          <Badge className='capitalize' variant='secondary'>
                            {f.renewalType}
                          </Badge>
                          <Badge className='capitalize' variant='secondary'>
                            Rs. {f.amount}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  );
                },
                enableHiding: false,
                header: 'Fee'
              },
              {
                cell: ({ row }) => (
                  <Menu
                    id={row.original.id.toString()}
                    isAdmin={isAdmin}
                    isHeader={false}
                    user={props.user}
                  />
                ),
                header: ({ table }) =>
                  isAdmin && (
                    <Menu
                      ids={table
                        .getSelectedRowModel()
                        .rows.map(r => r.original.id.toString())}
                      isAdmin={isAdmin}
                      isHeader={true}
                      user={props.user}
                    />
                  ),
                id: 'actions'
              }
            ] as ColumnDef<Row>[]
          }
          data={props.memberships}
          filterConfig={[{ id: 'name', placeholder: 'Name...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
