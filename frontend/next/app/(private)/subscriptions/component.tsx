'use client';

import z from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { ColumnDef } from '@tanstack/react-table';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconDotsVertical } from '@tabler/icons-react';

import Footer from '@/components/footer';
import { MESSAGES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import handler from '@/components/display-toast';
import { membershipSchema } from '@/lib/schemas';
import { Checkbox } from '@/components/ui/checkbox';
import { catchErrors, hasPermission } from '@/lib/utils';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { DragHandle, DataTable } from '@/components/ui/data-table';

import {
  Fee,
  Prisma,
  User as PrismaUser,
  SubscriptionStatus,
  MembershipTransaction
} from '@prisma/client';

import {
  payForMembership,
  deleteMedicationForm,
  updateMedicationForm,
  deleteMedicationForms
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
  status,
  isHeader = false
}: {
  id?: string;
  ids?: string[];
  isHeader: boolean;
  status: SubscriptionStatus;
}) {
  const menuTrigger = (
    <DropdownMenuTrigger asChild>
      <Button
        size="icon"
        variant="ghost"
        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
      >
        <IconDotsVertical />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {!isHeader && menuTrigger}
      {ids && ids.length > 0 && isHeader && menuTrigger}
      <DropdownMenuContent align="end" className="w-32">
        {(status === 'pending' || status === 'cancelled') && (
          <DropdownMenuItem
            onClick={async () => {
              if (!isHeader) {
                toast.promise(payForMembership(id as string), {
                  position: 'top-center',
                  success: MESSAGES.PAYMENT.PROCESSED,
                  loading: 'Processing payment...',
                  error(error) {
                    const { message } = catchErrors(error as Error);
                    return <span className="text-destructive">{message}</span>;
                  }
                });
              }
            }}
          >
            Pay Now
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            if (!isHeader) {
              toast.promise(deleteMedicationForm(id as string), {
                position: 'top-center',
                loading: 'Deleting subscription',
                success: MESSAGES.MEMBERSHIP_SUBSCRIPTION.DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className="text-destructive">{message}</span>;
                }
              });
            }

            if (isHeader) {
              toast.promise(deleteMedicationForms(ids as string[]), {
                position: 'top-center',
                loading: 'Deleting subscriptions',
                success: MESSAGES.MEMBERSHIP_SUBSCRIPTION.BULK_DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className="text-destructive">{message}</span>;
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
}) {
  const isMobile = useIsMobile();
  const form = useForm({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      perks: props.item.membership.perks,
      hospitalMemberships: props.item.membership.hospitalMemberships,
      fees: [props.item.fee]
    }
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
        <Button variant="link" className="text-foreground px-0 capitalize">
          {props.item.membership.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="capitalize">{props.item.name}</DrawerTitle>
          <DrawerDescription>
            Change the details for the selected membership
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            id="membership-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2 overflow-y-auto p-4 text-sm"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      value={field.value}
                      placeholder="Tablet"
                      className="capitalize"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="perks"
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
                            className="capitalize"
                            placeholder="Limited facilities with a basic plan."
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
              name="hospitalMemberships"
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
                            className="capitalize"
                            placeholder="Riverside General Hospital"
                          />
                        </li>
                      ))}
                    </ul>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>Fee</Label>
              <Input
                disabled
                placeholder="Rs. 100"
                className="capitalize"
                value={props.item.fee.amount}
              />
            </div>
          </form>
        </Form>
        <DrawerFooter>
          <Button
            type="submit"
            form="membership-form"
            className="cursor-pointer"
            disabled={form.formState.isLoading}
          >
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" asChild>
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
        id: 'drag',
        cell: ({ row }) => <DragHandle id={row.original.id} />
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
            item={props.subscriptions.find(
              m => m.id === String(row.original.id)
            )}
          />
        )
      },
      {
        header: 'User',
        enableHiding: false,
        accessorKey: 'user',
        cell: ({ row }) => (
          <span className="capitalize">{row.original.user.name}</span>
        )
      },
      {
        header: 'Perks',
        enableHiding: false,
        accessorKey: 'perks',
        cell: ({ row }) => (
          <ul className="space-y-2">
            {row.original.membership.perks.map((p, i) => (
              <li key={i}>
                <Badge variant="outline">{p}</Badge>
              </li>
            ))}
          </ul>
        )
      },
      {
        header: 'Hospitals',
        enableHiding: false,
        accessorKey: 'hospitals',
        cell: ({ row }) => (
          <ul className="space-y-2">
            {row.original.membership.hospitalMemberships.map((hm, i) => (
              <li key={i}>
                <Badge className="capitalize">{hm.hospital.name}</Badge>
              </li>
            ))}
          </ul>
        )
      },
      {
        header: 'Status',
        enableHiding: false,
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
            <Badge className="capitalize" variant={variant}>
              {row.original.status}
            </Badge>
          );
        }
      },
      {
        header: 'Fee',
        accessorKey: 'fee',
        enableHiding: false,
        cell: ({ row }) => (
          <ul className="space-y-2">
            <Badge variant="secondary" className="capitalize">
              {row.original.fee.amount}
            </Badge>
          </ul>
        )
      },
      {
        id: 'actions',
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
              status="pending"
              ids={table
                .getSelectedRowModel()
                .rows.map(r => r.original.id.toString())}
            />
          );
        }
      }
    ],
    [props.subscriptions]
  );

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
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
