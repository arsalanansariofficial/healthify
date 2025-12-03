'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Speciality, TimeSlot, User as Doctor } from '@prisma/client';
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
  DrawerTrigger,
  DrawerContent,
  DrawerDescription
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  deleteSpeciality,
  updateSpeciality,
  deleteSpecialities
} from '@/lib/actions';
import { MESSAGES } from '@/lib/constants';
import { nameSchema } from '@/lib/schemas';
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
            if (!isHeader)
              toast.promise(deleteSpeciality(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting speciality',
                position: 'top-center',
                success: MESSAGES.SPECIALITY.DELETED
              });

            if (isHeader)
              toast.promise(deleteSpecialities(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting specialities',
                position: 'top-center',
                success: MESSAGES.SPECIALITY.BULK_DELETED
              });
          }}
          variant='destructive'
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableCellViewer(props: { item: Speciality }) {
  const isMobile = useIsMobile();

  const { handleSubmit, pending } = useHookForm(
    handler,
    updateSpeciality.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  const form = useForm({
    defaultValues: { name: String() },
    resolver: zodResolver(nameSchema)
  });

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button className='text-foreground px-0' variant='link'>
          {props.item.id.slice(-5)}
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
              className='space-y-2'
              id='speciality-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speciality</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Physician' type='name' />
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
            className='cursor-pointer'
            disabled={pending}
            form='speciality-form'
            type='submit'
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
    UserSpecialities: { speciality: { name: string } }[];
  })[];
}) {
  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:specialities') && (
        <DataTable
          button={
            <Button asChild>
              <Link href='/specialities/add'>Add</Link>
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
                    onCheckedChange={value =>
                      row.toggleSelected(Boolean(value))
                    }
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
                header: 'Id',
                id: 'id'
              },
              {
                accessorKey: 'name',
                cell: ({ row }) => (
                  <span className='capitalize'>{row.original.name}</span>
                ),
                enableHiding: false,
                header: 'Name',
                id: 'name'
              },
              {
                cell: ({ row }) => (
                  <Menu id={row.original.id.toString()} isHeader={false} />
                ),
                header: ({ table }) => (
                  <Menu
                    ids={table
                      .getSelectedRowModel()
                      .rows.map(r => r.original.id.toString())}
                    isHeader={true}
                  />
                ),
                id: 'actions'
              }
            ] as ColumnDef<Speciality>[]
          }
          data={props.specialities}
          filterConfig={[{ id: 'name', placeholder: 'Name' }]}
        />
      )}
      <Footer />
    </div>
  );
}
