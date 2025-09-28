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
import { Fee, Membership, Prisma } from '@prisma/client';

import Footer from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import handler from '@/components/display-toast';
import { membershipSchema } from '@/lib/schemas';
import { Checkbox } from '@/components/ui/checkbox';
import { catchErrors, getDate, hasPermission } from '@/lib/utils';
import { DragHandle, DataTable } from '@/components/ui/data-table';

import {
  MEDICATION_FORM_DELETED,
  MEDICATION_FORMS_DELETED
} from '@/lib/constants';

import {
  deleteMedicationForm,
  deleteMedicationForms,
  updateMedicationForm
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
  isHeader = false
}: {
  id?: string;
  ids?: string[];
  isHeader: boolean;
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
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            if (!isHeader) {
              toast.promise(deleteMedicationForm(id as string), {
                position: 'top-center',
                success: MEDICATION_FORM_DELETED,
                loading: 'Deleting medication form',
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className="text-destructive">{message}</span>;
                }
              });
            }

            if (isHeader) {
              toast.promise(deleteMedicationForms(ids as string[]), {
                position: 'top-center',
                success: MEDICATION_FORMS_DELETED,
                loading: 'Deleting medication forms',
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
      name: props.item.name,
      fees: props.item.fees,
      perks: props.item.perks,
      hospitalMemberships: props.item.hospitalMemberships
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
          {props.item.name}
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
  memberships: Membership[];
}) {
  const columns = useMemo<
    ColumnDef<{
      id: number;
      fees: Fee[];
      name: string;
      header: string;
      perks: string[];
      createdAt: string;
      hospitalMemberships: Prisma.HospitalMembershipGetPayload<{
        include: { hospital: true };
      }>[];
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
            item={props.memberships.find(m => m.id === String(row.original.id))}
          />
        )
      },
      {
        header: 'Perks',
        enableHiding: false,
        accessorKey: 'perks',
        cell: ({ row }) => (
          <ul className="space-y-2">
            {row.original.perks.map((p, i) => (
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
            {row.original.hospitalMemberships.map((hm, i) => (
              <li key={i}>
                <Badge className="capitalize">{hm.hospital.name}</Badge>
              </li>
            ))}
          </ul>
        )
      },
      {
        header: 'Fee',
        accessorKey: 'fee',
        enableHiding: false,
        cell: ({ row }) => (
          <ul className="space-y-2">
            {row.original.fees.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {f.renewalType}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  Rs. {f.amount}
                </Badge>
              </li>
            ))}
          </ul>
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
    [props.memberships]
  );

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          columns={columns}
          data={props.memberships}
          filterConfig={[{ id: 'name', placeholder: 'Name...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
