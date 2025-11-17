'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PharmaManufacturer } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { User } from 'next-auth';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  deletePharmaManufacturer,
  deletePharmaManufacturers,
  updatePharmaManufacturer
} from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { pharmaManufacturerSchema } from '@/lib/schemas';
import { catchErrors, hasPermission } from '@/lib/utils';

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
              toast.promise(deletePharmaManufacturer(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting manufacturer',
                position: 'top-center',
                success: MESSAGES.PHARMA_MANUFACTURER.DELETED
              });
            }

            if (isHeader) {
              toast.promise(deletePharmaManufacturers(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting manufacturers',
                position: 'top-center',
                success: MESSAGES.PHARMA_MANUFACTURER.BULK_DELETED
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

export function TableCellViewer(props: { item: PharmaManufacturer }) {
  const isMobile = useIsMobile();
  const form = useForm({
    defaultValues: {
      description: props.item.description || String(),
      name: props.item.name
    },
    resolver: zodResolver(pharmaManufacturerSchema)
  });

  const { handleSubmit } = useHookForm(
    handler,
    updatePharmaManufacturer.bind(null, props.item.id) as (
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
            Change the details for the selected manufacturer
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            className='space-y-2 overflow-y-auto p-4 text-sm'
            id='pharma-manufacturer-form'
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
                      placeholder='Pfizer'
                      type='text'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...{ ...field, value: field.value as string }}
                      placeholder='Manufactures medicines worldwide...'
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
            form='pharma-manufacturer-form'
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
  manufacturers: PharmaManufacturer[];
}) {
  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          button={
            <Button asChild>
              <Link href='/pharma-manufacturers/add'>Add</Link>
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
                accessorKey: 'description',
                cell: ({ row }) => (
                  <span className='line-clamp-1'>
                    {row.original.description}
                  </span>
                ),
                enableHiding: false,
                header: 'Description'
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
            ] as ColumnDef<PharmaManufacturer>[]
          }
          data={props.manufacturers}
          filterConfig={[{ id: 'name', placeholder: 'Name...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
