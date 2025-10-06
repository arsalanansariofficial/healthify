'use client';

import { Appointment, AppointmentStatus } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Printer, X } from 'lucide-react';
import { User } from 'next-auth';
import Link from 'next/link';
import { toast } from 'sonner';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, DragHandle } from '@/components/ui/data-table';
import {
  Drawer,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  deleteSpeciality,
  deleteSpecialities,
  updateAppointmentStatus
} from '@/lib/actions';
import { DATES, MESSAGES } from '@/lib/constants';
import {
  getDate,
  formatTime,
  catchErrors,
  isPastByTime,
  hasPermission
} from '@/lib/utils';

type Row = {
  id: string;
  date: string;
  time: string;
  doctor: string;
  patient: string;
  status: AppointmentStatus;
};

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
              toast.promise(deleteSpeciality(id as string), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting speciality',
                position: 'top-center',
                success: MESSAGES.SPECIALITY.DELETED
              });
            }

            if (isHeader) {
              toast.promise(deleteSpecialities(ids as string[]), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting specialities',
                position: 'top-center',
                success: MESSAGES.SPECIALITY.BULK_DELETED
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

function TableCellViewer(props: { user: User; item: Row }) {
  const isMobile = useIsMobile();
  const { date, status, time } = props.item;
  const isInFuture = isPastByTime(
    date,
    time,
    (DATES.EXPIRES_AT as number) * 1000
  );

  const { handleSubmit: confirmAppointment, pending: validating } = useHookForm(
    handler,
    updateAppointmentStatus.bind(
      null,
      props.item.id,
      AppointmentStatus.confirmed
    )
  );

  const { handleSubmit: cancelAppointment, pending: cancelling } = useHookForm(
    handler,
    updateAppointmentStatus.bind(
      null,
      props.item.id,
      AppointmentStatus.cancelled
    )
  );

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button className='text-foreground px-0' variant='link'>
          {props.item.id.slice(-5)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='gap-1'>
          <DrawerTitle>Appointment</DrawerTitle>
          <DrawerDescription>
            Here are the details of the appointment.
          </DrawerDescription>
        </DrawerHeader>
        <div className='flex flex-col gap-4 overflow-y-auto px-4 text-sm'>
          <form className='space-y-2' id='appointment-form'>
            <div className='space-y-2'>
              <Label htmlFor='patient-name'>Patient</Label>
              <Input
                className='capitalize'
                defaultValue={props.item.patient}
                disabled
                id='patient-name'
                name='patient-name'
                placeholder='Gwen Tennyson'
                readOnly
                type='text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='doctor-name'>Doctor</Label>
              <Input
                className='capitalize'
                defaultValue={props.item.doctor}
                disabled
                id='doctor-name'
                name='doctor-name'
                placeholder='Gwen Tennyson'
                readOnly
                type='text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='date'>Date</Label>
              <Input
                className='capitalize'
                defaultValue={getDate(props.item.date, false)}
                disabled
                id='date'
                name='date'
                placeholder='Aug 1 2025'
                type='text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='time'>Time</Label>
              <Input
                className='capitalize'
                defaultValue={formatTime(props.item.time)}
                disabled
                id='time'
                name='time'
                placeholder='10:00:00'
                type='text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Input
                className='capitalize'
                defaultValue={props.item.status}
                disabled
                id='status'
                name='status'
                placeholder='Confirmed'
                type='text'
              />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <div className='grid grid-flow-col gap-2'>
            {isInFuture &&
              (status === AppointmentStatus.pending ||
                status === AppointmentStatus.confirmed) &&
              hasPermission(props.user.permissions, 'cancel:appointment') && (
                <Button
                  className='cursor-pointer'
                  disabled={validating || cancelling}
                  form='appointment-form'
                  onClick={cancelAppointment}
                  type='submit'
                  variant='outline'
                >
                  {!isMobile && (
                    <span>{cancelling ? 'Cancelling...' : 'Cancel'}</span>
                  )}
                  <X />
                </Button>
              )}
            {isInFuture &&
              status === AppointmentStatus.pending &&
              hasPermission(props.user.permissions, 'confirm:appointment') && (
                <Button
                  className='cursor-pointer'
                  disabled={validating || cancelling}
                  form='appointment-form'
                  onClick={confirmAppointment}
                  type='submit'
                >
                  {!isMobile && (
                    <span>{validating ? 'Saving...' : 'Confirm'}</span>
                  )}
                  <Check />
                </Button>
              )}
            {status === AppointmentStatus.confirmed &&
              hasPermission(props.user.permissions, 'view:receipt') && (
                <Button
                  asChild
                  className='cursor-pointer'
                  form='appointment-form'
                  type='submit'
                >
                  <Link href={`/appointments/${props.item.id}/receipt`}>
                    {!isMobile && <span>View Receipt</span>}
                    <Printer />
                  </Link>
                </Button>
              )}
          </div>
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
  appointments: (Appointment & Row)[];
}) {
  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      {hasPermission(props.user.permissions, 'view:appointments') && (
        <DataTable
          columns={
            [
              {
                cell({ row }) {
                  return <DragHandle id={row.original.id} />;
                },
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
                header({ table }) {
                  return (
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
                  );
                },
                id: 'select'
              },
              {
                accessorKey: 'id',
                cell({ row }) {
                  return (
                    <TableCellViewer
                      item={row.original}
                      key={Date.now()}
                      user={props.user}
                    />
                  );
                },
                enableHiding: false,
                header: 'Id',
                id: 'id'
              },
              {
                accessorKey: 'doctor',
                cell({ row }) {
                  return <span>{row.original.doctor}</span>;
                },
                enableHiding: false,
                header: 'Doctor',
                id: 'doctor'
              },
              {
                accessorKey: 'patient',
                cell({ row }) {
                  return <span>{row.original.patient}</span>;
                },
                enableHiding: false,
                header: 'Patient',
                id: 'patient'
              },
              {
                accessorKey: 'time',
                cell({ row }) {
                  const time = row.original.time;
                  return <span>{formatTime(time as string)}</span>;
                },
                header: 'Time',
                id: 'time'
              },
              {
                accessorKey: 'status',
                cell({ row }) {
                  let variant: BadgeVariant = 'default';
                  const status = row.original.status;

                  if (status === AppointmentStatus.pending) variant = 'outline';
                  if (status === AppointmentStatus.confirmed)
                    variant = 'secondary';
                  if (status === AppointmentStatus.cancelled)
                    variant = 'destructive';

                  return (
                    <Badge className='capitalize' variant={variant}>
                      {status}
                    </Badge>
                  );
                },
                header: 'Status',
                id: 'status'
              },
              {
                accessorKey: 'date',
                cell({ row }) {
                  return <span>{getDate(row.original.date, false)}</span>;
                },
                header: 'Date',
                id: 'date'
              },
              {
                cell({ row }) {
                  return (
                    <Menu id={row.original.id.toString()} isHeader={false} />
                  );
                },
                header({ table }) {
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
            ] as ColumnDef<Appointment & Row>[]
          }
          data={props.appointments}
          filterConfig={[
            { id: 'patient', placeholder: 'Patient' },
            { id: 'date', placeholder: 'Date', type: 'date' },
            { id: 'time', placeholder: 'Time', type: 'time' }
          ]}
        />
      )}
      <Footer />
    </div>
  );
}
