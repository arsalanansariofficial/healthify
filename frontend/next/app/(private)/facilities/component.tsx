'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Facility } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { User } from 'next-auth';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
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
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  deleteFacility,
  updateFacility,
  deleteFacilities
} from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { facilitySchema } from '@/lib/schemas';
import { catchErrors, getDate, hasPermission } from '@/lib/utils';

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
            if (!isHeader) {
              toast.promise(deleteFacility(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting facility',
                position: 'top-center',
                success: MESSAGES.FACILITY.DELETED
              });
            }

            if (isHeader) {
              toast.promise(deleteFacilities(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting facilities',
                position: 'top-center',
                success: MESSAGES.FACILITY.BULK_DELETED
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

export function TableCellViewer<T extends z.ZodType>(props: {
  item: z.infer<T>;
}) {
  const isMobile = useIsMobile();
  const form = useForm({
    defaultValues: {
      name: props.item.name
    },
    resolver: zodResolver(facilitySchema)
  });

  const { handleSubmit } = useHookForm(
    handler,
    updateFacility.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>
  );

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button className='text-foreground px-0 capitalize' variant='link'>
          {props.item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className='capitalize'>{props.item.name}</DrawerTitle>
          <DrawerDescription>
            Change the details for the selected department
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            className='space-y-2 overflow-y-auto p-4 text-sm'
            id='department-form'
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
                      onChange={({ target: { value } }) =>
                        field.onChange(value || undefined)
                      }
                      placeholder='Gwen Tennyson'
                      type='text'
                      value={field.value}
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
            form='department-form'
            type='submit'
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
  facilities: Facility[];
}) {
  const columns = useMemo<
    ColumnDef<{
      id: number;
      name: string;
      email: string;
      header: string;
      createdAt: string;
      city: string | null;
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
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        id: 'select'
      },
      {
        accessorKey: 'name',
        cell: ({ row }) => (
          <TableCellViewer
            item={props.facilities.find(h => h.id === String(row.original.id))}
            key={Date.now()}
          />
        ),
        enableHiding: false,
        header: 'Name'
      },
      {
        accessorKey: 'createdAt',
        cell: ({ row }) => getDate(row.original.createdAt),
        header: () => <div>Created At</div>
      },
      {
        cell: ({ row }) => (
          <Menu id={row.original.id.toString()} isHeader={false} />
        ),
        header: ({ table }) => {
          return (
            <Menu
              ids={table
                .getSelectedRowModel()
                .rows.map(r => r.original.id.toString())}
              isHeader={true}
            />
          );
        },
        id: 'actions'
      }
    ],
    [props.facilities]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          columns={columns}
          data={props.facilities}
          filterConfig={[{ id: 'name', placeholder: 'Name...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
