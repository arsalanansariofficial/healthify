'use client';

import z from 'zod';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { User as Doctor } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Speciality, TimeSlot } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconDotsVertical } from '@tabler/icons-react';

import Footer from '@/components/footer';
import { nameSchema } from '@/lib/schemas';
import { MESSAGES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import handler from '@/components/display-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { catchErrors, hasPermission } from '@/lib/utils';
import { DragHandle, DataTable } from '@/components/ui/data-table';

import {
  deleteSpeciality,
  updateSpeciality,
  deleteSpecialities
} from '@/lib/actions';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  Drawer,
  DrawerClose,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
  DrawerContent,
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
              toast.promise(deleteSpeciality(id as string), {
                position: 'top-center',
                loading: 'Deleting speciality',
                success: MESSAGES.SPECIALITY.DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                }
              });
            }

            if (isHeader) {
              toast.promise(deleteSpecialities(ids as string[]), {
                position: 'top-center',
                loading: 'Deleting specialities',
                success: MESSAGES.SPECIALITY.BULK_DELETED,
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

  const { pending, handleSubmit } = useHookForm(
    handler,
    updateSpeciality.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: String() }
  });

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant='link' className='text-foreground px-0'>
          {props.item.id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='gap-1'>
          <DrawerTitle>Speciality</DrawerTitle>
          <DrawerDescription>
            You can change the name for the selected speciality
          </DrawerDescription>
        </DrawerHeader>
        <div className='flex flex-col gap-4 overflow-y-auto px-4 text-sm'>
          <Form {...form}>
            <form
              id='speciality-form'
              className='space-y-2'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name='name'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speciality</FormLabel>
                    <FormControl>
                      <Input {...field} type='name' placeholder='Physician' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DrawerFooter>
          <Button
            type='submit'
            disabled={pending}
            form='speciality-form'
            className='cursor-pointer'
          >
            {pending ? 'Saving...' : 'Save'}
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
  specialities: Speciality[];
  doctors: (Doctor & {
    timings: TimeSlot[];
    UserSpecialities: {
      speciality: { name: string };
    }[];
  })[];
}) {
  const columns = useMemo<ColumnDef<{ id: number; name: string }>[]>(
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
        id: 'id',
        header: 'Id',
        accessorKey: 'id',
        cell: ({ row }) => (
          <TableCellViewer
            key={Date.now()}
            item={props.specialities.find(
              s => s.id === String(row.original.id)
            )}
          />
        )
      },
      {
        id: 'name',
        header: 'Name',
        enableHiding: false,
        accessorKey: 'name',
        cell: ({ row }) => (
          <span>
            {
              props.specialities.find(s => s.id === String(row.original.id))
                ?.name
            }
          </span>
        )
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
    [props.specialities]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:specialities') && (
        <DataTable
          columns={columns}
          data={props.specialities}
          filterConfig={[{ id: 'name', placeholder: 'Name' }]}
        />
      )}
      <Footer />
    </div>
  );
}
