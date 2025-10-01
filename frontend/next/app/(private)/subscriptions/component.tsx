'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Fee,
  Prisma,
  User as PrismaUser,
  SubscriptionStatus,
  MembershipTransaction
} from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { User } from 'next-auth';
import Link from 'next/link';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

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
import {
  payForMembership,
  deleteMedicationForm,
  updateMedicationForm,
  deleteMedicationForms
} from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { membershipSchema } from '@/lib/schemas';
import { catchErrors, hasPermission } from '@/lib/utils';

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
          variant='destructive'
          onClick={async () => {
            if (!isHeader) {
              toast.promise(deleteMedicationForm(id as string), {
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
              toast.promise(deleteMedicationForms(ids as string[]), {
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
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableCellViewer<T extends z.ZodType>(props: {
  item: z.infer<T>;
}) {
  const isMobile = useIsMobile();
  const form = useForm({
    defaultValues: {
      fees: [props.item.fee],
      hospitalMemberships: props.item.membership.hospitalMemberships,
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
        <Button variant='link' className='text-foreground px-0 capitalize'>
          {props.item.membership.name}
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
            id='membership-form'
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
                      placeholder='Tablet'
                      className='capitalize'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='perks'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perks</FormLabel>
                  <FormControl>
                    <ul>
                      {field.value.map((p, i) => (
                        <li key={i}>
                          <Input
                            {...field}
                            disabled
                            value={p}
                            className='capitalize'
                            placeholder='Limited facilities with a basic plan.'
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
              name='hospitalMemberships'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospitals</FormLabel>
                  <FormControl>
                    <ul>
                      {field.value.map((hm, i) => (
                        <li key={i}>
                          <Input
                            {...field}
                            disabled
                            value={hm.name}
                            className='capitalize'
                            placeholder='Riverside General Hospital'
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
                disabled
                placeholder='Rs. 100'
                className='capitalize'
                value={props.item.fee.amount}
              />
            </div>
          </form>
        </Form>
        <DrawerFooter>
          <Button
            type='submit'
            form='membership-form'
            className='cursor-pointer'
            disabled={form.formState.isLoading}
          >
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
          <DrawerClose asChild>
            <Button variant='outline' asChild>
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

export default function Component(props: {
  user: User;
  subscriptions: Prisma.MembershipSubscriptionGetPayload<{
    include: {
      fee: true;
      user: true;
      transactions: true;
      membership: {
        include: { hospitalMemberships: { include: { hospital: true } } };
      };
    };
  }>[];
}) {
  const columns = useMemo<
    ColumnDef<{
      fee: Fee;
      id: number;
      name: string;
      header: string;
      user: PrismaUser;
      createdAt: string;
      status: SubscriptionStatus;
      transactions: MembershipTransaction[];
      membership: Prisma.MembershipGetPayload<{
        include: { hospitalMemberships: { include: { hospital: true } } };
      }>;
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
            item={props.subscriptions.find(
              m => m.id === String(row.original.id)
            )}
          />
        ),
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
            {row.original.membership.hospitalMemberships.map((hm, i) => (
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
            <Badge variant='secondary' className='capitalize'>
              {row.original.fee.amount}
            </Badge>
          </ul>
        ),
        enableHiding: false,
        header: 'Fee'
      },
      {
        cell: ({ row }) => (
          <Menu
            isHeader={false}
            status={row.original.status}
            id={row.original.id.toString()}
          />
        ),
        header: ({ table }) => {
          return (
            <Menu
              isHeader={true}
              status='pending'
              ids={table
                .getSelectedRowModel()
                .rows.map(r => r.original.id.toString())}
            />
          );
        },
        id: 'actions'
      }
    ],
    [props.subscriptions]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          columns={columns}
          data={props.subscriptions}
          filterConfig={[{ id: 'name', placeholder: 'Name...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
