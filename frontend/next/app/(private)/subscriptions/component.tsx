'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { User } from 'next-auth';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  deleteSubscription,
  deleteSubscriptions
} from '@/actions/subscription';
import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Badge, BadgeVariant } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { payForMembership, updateMedicationForm } from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { membershipSchema } from '@/lib/schemas';
import { catchErrors, hasPermission } from '@/lib/utils';

type Row = Prisma.MembershipSubscriptionGetPayload<{
  include: {
    fee: true;
    user: true;
    transactions: true;
    membership: {
      include: { hospitalMemberships: { include: { hospital: true } } };
    };
  };
}>;

function Menu({
  id,
  ids,
  isHeader = false,
  status
}: {
  id?: string;
  ids?: string[];
  isHeader: boolean;
  status: SubscriptionStatus;
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
        {(status === 'pending' || status === 'cancelled') && (
          <DropdownMenuItem
            onClick={async () => {
              if (!isHeader) {
                toast.promise(payForMembership(id as string), {
                  error(error) {
                    const { message } = catchErrors(error as Error);
                    return <span className='text-destructive'>{message}</span>;
                  },
                  loading: 'Processing payment...',
                  position: 'top-center',
                  success: MESSAGES.PAYMENT.PROCESSED
                });
              }
            }}
          >
            Pay Now
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={async () => {
            if (!isHeader) {
              toast.promise(deleteSubscription(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting subscription',
                position: 'top-center',
                success: MESSAGES.MEMBERSHIP_SUBSCRIPTION.DELETED
              });
            }

            if (isHeader) {
              toast.promise(deleteSubscriptions(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting subscriptions',
                position: 'top-center',
                success: MESSAGES.MEMBERSHIP_SUBSCRIPTION.BULK_DELETED
              });
            }
          }}
          variant='destructive'
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableCellViewer(props: { item: Row }) {
  const isMobile = useIsMobile();
  const form = useForm({
    defaultValues: {
      fees: [props.item.fee],
      hospitalMemberships: props.item.membership.hospitalMemberships.map(
        hm => ({
          ...hm,
          hospital: {
            ...hm.hospital,
            address: hm.hospital.address as string,
            isAffiliated: (hm.hospital.isAffiliated ? 'yes' : 'no') as
              | 'yes'
              | 'no'
          }
        })
      ),
      perks: props.item.membership.perks
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
          {props.item.membership.id.slice(-5)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='capitalize'>
            {props.item.membership.name}
          </DrawerTitle>
          <DrawerDescription>
            Change the details for the selected membership
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            className='space-y-2 overflow-y-auto p-4 text-sm'
            id='membership-form'
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
                      placeholder='Tablet'
                      type='text'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='perks'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perks</FormLabel>
                  <FormControl>
                    <ul>
                      {field.value.map((p, i) => (
                        <li key={i}>
                          <Input
                            {...field}
                            className='capitalize'
                            disabled
                            placeholder='Limited facilities with a basic plan.'
                            value={p}
                          />
                        </li>
                      ))}
                    </ul>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='hospitalMemberships'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospitals</FormLabel>
                  <FormControl>
                    <ul>
                      {field.value.map((hm, i) => (
                        <li key={i}>
                          <Input
                            {...field}
                            className='capitalize'
                            disabled
                            placeholder='Riverside General Hospital'
                            value={hm.hospital.name}
                          />
                        </li>
                      ))}
                    </ul>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='space-y-2'>
              <Label>Fee</Label>
              <Input
                className='capitalize'
                disabled
                placeholder='Rs. 100'
                value={props.item.fee.amount || 0}
              />
            </div>
          </form>
        </Form>
        <DrawerFooter>
          <Button
            className='cursor-pointer'
            disabled={form.formState.isLoading}
            form='membership-form'
            type='submit'
          >
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
          <DrawerClose asChild>
            <Button asChild variant='outline'>
              <Link href={`/memberships/${props.item.id}/subscribe`}>
                Subscribe
              </Link>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function Component(props: { user: User; subscriptions: Row[] }) {
  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:subscriptions') && (
        <DataTable
          button={
            <Button asChild>
              <Link href='/subscriptions/add'>Add</Link>
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
                    onCheckedChange={value => row.toggleSelected(!!value)}
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
                      table.toggleAllPageRowsSelected(!!value)
                    }
                  />
                ),
                id: 'select'
              },
              {
                accessorKey: 'id',
                cell: ({ row }) => (
                  <TableCellViewer
                    item={
                      props.subscriptions.find(
                        m => m.id === String(row.original.id)
                      )!
                    }
                    key={Date.now()}
                  />
                ),
                enableHiding: false,
                header: 'Id'
              },
              {
                accessorKey: 'name',
                cell: ({ row }) =>
                  props.subscriptions.find(
                    m => m.id === String(row.original.id)
                  )!.membership.name,
                enableHiding: false,
                header: 'Name'
              },
              {
                accessorKey: 'user',
                cell: ({ row }) => (
                  <span className='capitalize'>{row.original.user.name}</span>
                ),
                enableHiding: false,
                header: 'User'
              },
              {
                accessorKey: 'perks',
                cell: ({ row }) => (
                  <ul className='space-y-2'>
                    {row.original.membership.perks.map((p, i) => (
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
                cell: ({ row }) => (
                  <ul className='space-y-2'>
                    {row.original.membership.hospitalMemberships.map(
                      (hm, i) => (
                        <li key={i}>
                          <Badge className='capitalize'>
                            {hm.hospital.name}
                          </Badge>
                        </li>
                      )
                    )}
                  </ul>
                ),
                enableHiding: false,
                header: 'Hospitals'
              },
              {
                accessorKey: 'status',
                cell: ({ row }) => {
                  let variant: BadgeVariant = 'default';

                  if (row.original.status === SubscriptionStatus.pending) {
                    variant = 'outline';
                  }

                  if (row.original.status === SubscriptionStatus.cancelled) {
                    variant = 'destructive';
                  }

                  return (
                    <Badge className='capitalize' variant={variant}>
                      {row.original.status}
                    </Badge>
                  );
                },
                enableHiding: false,
                header: 'Status'
              },
              {
                accessorKey: 'fee',
                cell: ({ row }) => (
                  <ul className='space-y-2'>
                    <Badge className='capitalize' variant='secondary'>
                      Rs. {row.original.fee.amount}
                    </Badge>
                  </ul>
                ),
                enableHiding: false,
                header: 'Fee'
              },
              {
                cell: ({ row }) => (
                  <Menu
                    id={row.original.id.toString()}
                    isHeader={false}
                    status={row.original.status}
                  />
                ),
                header: ({ table }) => {
                  return (
                    <Menu
                      ids={table
                        .getSelectedRowModel()
                        .rows.map(r => r.original.id.toString())}
                      isHeader={true}
                      status='pending'
                    />
                  );
                },
                id: 'actions'
              }
            ] as ColumnDef<Row>[]
          }
          data={props.subscriptions}
          filterConfig={[{ id: 'name', placeholder: 'Name...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
