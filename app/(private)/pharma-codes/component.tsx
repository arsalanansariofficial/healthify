'use client';

import z from 'zod';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { PharmaCode } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconDotsVertical } from '@tabler/icons-react';

import Footer from '@/components/footer';
import { MESSAGES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import { pharmaCodeSchema } from '@/lib/schemas';
import { useIsMobile } from '@/hooks/use-mobile';
import handler from '@/components/display-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { catchErrors, getDate, hasPermission } from '@/lib/utils';
import { DragHandle, DataTable } from '@/components/ui/data-table';

import {
  deletePharmaCode,
  deletePharmaCodes,
  updatePharmaCode
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
              toast.promise(deletePharmaCode(id as string), {
                position: 'top-center',
                loading: 'Deleting code',
                success: MESSAGES.PHARMA_CODE.DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                }
              });
            }

            if (isHeader) {
              toast.promise(deletePharmaCodes(ids as string[]), {
                position: 'top-center',
                loading: 'Deleting departments',
                success: MESSAGES.PHARMA_CODE.BULK_DELETED,
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
}) {
  const isMobile = useIsMobile();
  const form = useForm({
    resolver: zodResolver(pharmaCodeSchema),
    defaultValues: {
      code: props.item.code,
      frequency: props.item.frequency,
      description: props.item.description
    }
  });

  const { handleSubmit } = useHookForm(
    handler,
    updatePharmaCode.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>
  );

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant='link' className='text-foreground px-0 capitalize'>
          {props.item.code}
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
            id='department-form'
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-2 overflow-y-auto p-4 text-sm'
          >
            <FormField
              name='frequency'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      min={1}
                      type='number'
                      placeholder='1 tablet'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='code'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='text'
                      placeholder='Q4H'
                      className='capitalize'
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
                      placeholder='Single dose every 4 hours.'
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
            form='department-form'
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

export default function Component(props: { user: User; codes: PharmaCode[] }) {
  const columns = useMemo<
    ColumnDef<{
      id: number;
      code: string;
      header: string;
      frequency: string;
      createdAt: string;
      description: string;
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
        header: 'Code',
        enableHiding: false,
        accessorKey: 'code',
        cell: ({ row }) => (
          <TableCellViewer
            key={Date.now()}
            item={props.codes.find(h => h.id === String(row.original.id))}
          />
        )
      },
      {
        header: 'Frequency',
        accessorKey: 'frequency',
        cell: ({ row }) => (
          <Badge className='mx-auto'>{row.original.frequency}</Badge>
        )
      },
      {
        enableHiding: false,
        header: 'Description',
        accessorKey: 'description',
        cell: ({ row }) => row.original.description
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
    [props.codes]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:users') && (
        <DataTable
          columns={columns}
          data={props.codes}
          filterConfig={[{ id: 'code', placeholder: 'Code...' }]}
        />
      )}
      <Footer />
    </div>
  );
}
