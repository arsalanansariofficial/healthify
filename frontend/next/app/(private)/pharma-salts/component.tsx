'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PharmaSalt } from '@prisma/client';
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
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  deletePharmaSalt,
  deletePharmaSalts,
  updatePharmaSalt
} from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { pharmaManufacturerSchema } from '@/lib/schemas';
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
              toast.promise(deletePharmaSalt(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting pharma salt',
                position: 'top-center',
                success: MESSAGES.PHARMA_SALT.DELETED
              });
            }

            if (isHeader) {
              toast.promise(deletePharmaSalts(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting pharma salts',
                position: 'top-center',
                success: MESSAGES.PHARMA_SALT.BULK_DELETED
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
      description: props.item.description,
      name: props.item.name
    },
    resolver: zodResolver(pharmaManufacturerSchema)
  });

  const { handleSubmit } = useHookForm(
    handler,
    updatePharmaSalt.bind(null, props.item.id) as (
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
            Change the details for the selected salt
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            id='pharma-salt-form'
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
                      className='capitalize'
                      placeholder='Atorvastatin'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='description'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='This is an active pharmaceutical ingredient.'
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
            form='pharma-salt-form'
            disabled={form.formState.isLoading}
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

export default function Component(props: { user: User; salts: PharmaSalt[] }) {
  const columns = useMemo<
    ColumnDef<{
      id: number;
      name: string;
      header: string;
      createdAt: string;
      description: string;
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
            item={props.salts.find(m => m.id === String(row.original.id))}
          />
        ),
        enableHiding: false,
        header: 'Name'
      },
      {
        accessorKey: 'description',
        cell: ({ row }) => (
          <span className='line-clamp-1'>{row.original.description}</span>
        ),
        enableHiding: false,
        header: 'Description'
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
    [props.salts]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          columns={columns}
          data={props.salts}
          filterConfig={[{ id: 'name', placeholder: 'Name...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
