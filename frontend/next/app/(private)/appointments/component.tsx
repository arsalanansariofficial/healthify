'use client';

import { Appointment, AppointmentStatus } from '@prisma/client';
import { IconDotsVertical } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Printer, Trash, X } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import useHookForm from '@/hooks/use-hook-form';
import {
  updateAppointmentStatus,
  deleteAppointment,
  deleteAppointments
} from '@/lib/actions';
import { DATES, MESSAGES, ROLES } from '@/lib/constants';
import {
  getDate,
  formatTime,
  catchErrors,
  isPastByTime,
  hasPermission,
  hasRole
} from '@/lib/utils';

type Row = {
  id: string;
  date: Date;
  time: string;
  doctor: string;
  patient: string;
  status: AppointmentStatus;
};

function HeaderMenu({ ids }: { ids: string[] }) {
  return (
    <DropdownMenu>
      {ids.length > 0 && (
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
      )}
      <DropdownMenuContent align='end' className='w-32'>
        <DropdownMenuItem
          className='flex cursor-pointer items-center justify-between gap-1'
          onClick={async () => {
            toast.promise(deleteAppointments(ids), {
              error(error) {
                const { message } = catchErrors(error as Error);
                return <span className='text-destructive'>{message}</span>;
              },
              loading: 'Deleting appointments',
              position: 'top-center',
              success: MESSAGES.APPOINTMENT.BULK_DELETED
            });
          }}
          variant='destructive'
        >
          <span>Delete</span>
          <Trash />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Menu({ appointment, user }: { user: User; appointment: Row }) {
  const { date, id: appointmentId, status, time } = appointment;
  const isInFuture = isPastByTime(
    date,
    time,
    (DATES.EXPIRES_AT as number) * 1000
  );

  const { handleSubmit: confirmAppointment, pending: validating } = useHookForm(
    handler,
    updateAppointmentStatus.bind(
      null,
      appointmentId,
      AppointmentStatus.confirmed
    )
  );

  const { handleSubmit: cancelAppointment, pending: cancelling } = useHookForm(
    handler,
    updateAppointmentStatus.bind(
      null,
      appointmentId,
      AppointmentStatus.cancelled
    )
  );

  return (
    <DropdownMenu>
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
      <DropdownMenuContent align='end' className='w-32'>
        {hasRole(user.roles, ROLES.ADMIN as string) && (
          <DropdownMenuItem
            className='d-flex cursor-pointer items-center justify-between gap-1'
            onClick={async () => {
              toast.promise(deleteAppointment(appointmentId), {
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className='text-destructive'>{message}</span>;
                },
                loading: 'Deleting appointment',
                position: 'top-center',
                success: MESSAGES.APPOINTMENT.DELETED
              });
            }}
            variant='destructive'
          >
            <span>Delete</span>
            <Trash />
          </DropdownMenuItem>
        )}
        {isInFuture &&
          (status === AppointmentStatus.pending ||
            status === AppointmentStatus.confirmed) &&
          hasPermission(user.permissions, 'cancel:appointment') && (
            <DropdownMenuItem
              className='flex cursor-pointer items-center justify-between gap-1'
              disabled={validating || cancelling}
              onClick={cancelAppointment}
            >
              <span>{cancelling ? 'Cancelling...' : 'Cancel'}</span>
              <X />
            </DropdownMenuItem>
          )}
        {isInFuture &&
          status === AppointmentStatus.pending &&
          hasPermission(user.permissions, 'confirm:appointment') && (
            <DropdownMenuItem
              className='flex cursor-pointer items-center justify-between gap-1'
              disabled={validating || cancelling}
              onClick={confirmAppointment}
            >
              <span>{validating ? 'Saving...' : 'Confirm'}</span>
              <Check />
            </DropdownMenuItem>
          )}
        {status === AppointmentStatus.confirmed &&
          hasPermission(user.permissions, 'view:receipt') && (
            <DropdownMenuItem>
              <Link
                className='flex w-full items-center justify-between gap-1'
                href={`/appointments/${appointmentId}/receipt`}
              >
                <span>Receipt</span>
                <Printer />
              </Link>
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Component(props: {
  user: User;
  appointments: (Appointment & Row)[];
}) {
  const isAdmin = hasRole(props.user.roles, ROLES.ADMIN as string);
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
                cell: ({ row }) =>
                  isAdmin && (
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
                    isAdmin && (
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
                    )
                  );
                },
                id: 'select'
              },
              {
                accessorKey: 'id',
                cell({ row }) {
                  return row.original.status === AppointmentStatus.confirmed ? (
                    <Link href={`/appointments/${row.original.id}`}>
                      {row.original.id.slice(-5)}
                    </Link>
                  ) : (
                    row.original.id.slice(-5)
                  );
                },
                enableHiding: false,
                header: 'Id',
                id: 'id'
              },
              {
                accessorKey: 'doctor',
                cell({ row }) {
                  return (
                    <span className='capitalize'>{row.original.doctor}</span>
                  );
                },
                enableHiding: false,
                header: 'Doctor',
                id: 'doctor'
              },
              {
                accessorKey: 'patient',
                cell({ row }) {
                  return (
                    <span className='capitalize'>{row.original.patient}</span>
                  );
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
                  return (
                    <span>{getDate(row.original.date.toString(), false)}</span>
                  );
                },
                header: 'Date',
                id: 'date'
              },
              {
                cell({ row }) {
                  return <Menu appointment={row.original} user={props.user} />;
                },
                header({ table }) {
                  return isAdmin ? (
                    <HeaderMenu
                      ids={table
                        .getSelectedRowModel()
                        .rows.map(r => r.original.id.toString())}
                    />
                  ) : null;
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
