'use client';

import z from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { User } from 'next-auth';
import * as RT from '@tanstack/react-table';
import * as Icons from '@tabler/icons-react';
import { Check, Printer, X } from 'lucide-react';
import { AppointmentStatus } from '@prisma/client';

import * as actions from '@/lib/actions';
import * as CONST from '@/lib/constants';
import Footer from '@/components/footer';
import Sidebar from '@/components/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import * as Drawer from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import * as DT from '@/components/ui/data-table';
import handler from '@/components/display-toast';
import * as DM from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { catchErrors, hasPermission } from '@/lib/utils';
import { Badge, BadgeVariant } from '@/components/ui/badge';

type Props = { user: User; appointments: Appointment[] };
type TableSchema = { id: number } & Omit<Appointment, 'id'>;
type MenuProps = { id?: string; ids?: string[]; isHeader: boolean };
type TCVProps<T extends z.ZodType> = { user: User; item: z.infer<T> };

type Appointment = {
  id: string;
  date: string;
  time: string;
  patientName: string;
  status: AppointmentStatus;
};

function findItem<T extends { id: string | string }>(
  items: T[],
  id: number | string
) {
  return items.find(item => String(item.id) === String(id));
}

function Menu({ id, ids, isHeader = false }: MenuProps) {
  const menuTrigger = (
    <DM.DropdownMenuTrigger asChild>
      <Button
        size="icon"
        variant="ghost"
        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
      >
        <Icons.IconDotsVertical />
        <span className="sr-only">Open menu</span>
      </Button>
    </DM.DropdownMenuTrigger>
  );

  return (
    <DM.DropdownMenu>
      {!isHeader && menuTrigger}
      {ids && ids.length > 0 && isHeader && menuTrigger}
      <DM.DropdownMenuContent align="end" className="w-32">
        <DM.DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            if (!isHeader) {
              toast.promise(actions.deleteSpeciality(id as string), {
                position: 'top-center',
                loading: 'Deleting speciality',
                success: CONST.SPECIALITY_DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className="text-destructive">{message}</span>;
                }
              });
            }

            if (isHeader) {
              toast.promise(actions.deleteSpecialities(ids as string[]), {
                position: 'top-center',
                loading: 'Deleting specialities',
                success: CONST.SPECIALITIES_DELETED,
                error(error) {
                  const { message } = catchErrors(error as Error);
                  return <span className="text-destructive">{message}</span>;
                }
              });
            }
          }}
        >
          Delete
        </DM.DropdownMenuItem>
      </DM.DropdownMenuContent>
    </DM.DropdownMenu>
  );
}

export function TableCellViewer<T extends z.ZodType>(props: TCVProps<T>) {
  const { status } = props.item;
  const isMobile = useIsMobile();
  const { pending } = useHookForm(handler, actions.getAppointment);

  return (
    <Drawer.Drawer direction={isMobile ? 'bottom' : 'right'}>
      <Drawer.DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant="link" className="text-foreground px-0">
          {props.item.id}
        </Button>
      </Drawer.DrawerTrigger>
      <Drawer.DrawerContent>
        <Drawer.DrawerHeader className="gap-1">
          <Drawer.DrawerTitle>Appointment</Drawer.DrawerTitle>
          <Drawer.DrawerDescription>
            Here are the details of the appointment.
          </Drawer.DrawerDescription>
        </Drawer.DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form id="appointment-form" className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Patient</Label>
              <Input
                disabled
                readOnly
                type="text"
                id="patient-name"
                name="patient-name"
                placeholder="Gwen Tennyson"
                defaultValue={props.item.patientName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                disabled
                id="date"
                name="date"
                type="date"
                placeholder="Aug 1 2025"
                defaultValue={props.item.date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                disabled
                id="time"
                name="time"
                type="text"
                placeholder="10:00:00"
                defaultValue={props.item.time}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                disabled
                id="status"
                type="text"
                name="status"
                className="capitalize"
                placeholder="Confirmed"
                defaultValue={props.item.status}
              />
            </div>
          </form>
        </div>
        <Drawer.DrawerFooter>
          <div className="grid grid-flow-col gap-2">
            {(status === 'pending' || status === 'confirmed') &&
              hasPermission(props.user.permissions, 'cancel:appointment') && (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={pending}
                  form="appointment-form"
                  className="cursor-pointer"
                >
                  {!isMobile && (
                    <span>{pending ? 'Cancelling...' : 'Cancel'}</span>
                  )}
                  <X />
                </Button>
              )}
            {status === 'pending' &&
              hasPermission(props.user.permissions, 'confirm:appointment') && (
                <Button
                  type="submit"
                  disabled={pending}
                  form="appointment-form"
                  className="cursor-pointer"
                >
                  {!isMobile && (
                    <span>{pending ? 'Saving...' : 'Confirm'}</span>
                  )}
                  <Check />
                </Button>
              )}
            {status === 'confirmed' &&
              hasPermission(props.user.permissions, 'view:receipt') && (
                <Button
                  asChild
                  type="submit"
                  disabled={pending}
                  form="appointment-form"
                  className="cursor-pointer"
                >
                  <Link href="/receipt">
                    {!isMobile && <span>View Receipt</span>}
                    <Printer />
                  </Link>
                </Button>
              )}
          </div>
          <Drawer.DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </Drawer.DrawerClose>
        </Drawer.DrawerFooter>
      </Drawer.DrawerContent>
    </Drawer.Drawer>
  );
}

export default function Component(props: Props) {
  const columns: RT.ColumnDef<TableSchema>[] = [
    {
      id: 'drag',
      cell({ row }) {
        return <DT.DragHandle id={row.original.id} />;
      }
    },
    {
      id: 'select',
      enableHiding: false,
      enableSorting: false,
      header({ table }) {
        return (
          <Checkbox
            aria-label="Select all"
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
        />
      )
    },
    {
      id: 'id',
      header: 'Id',
      accessorKey: 'id',
      enableHiding: false,
      cell({ row }) {
        return (
          <TableCellViewer
            key={Date.now()}
            user={props.user}
            item={findItem(props.appointments, row.original.id)}
          />
        );
      }
    },
    {
      id: 'patientName',
      enableHiding: false,
      header: 'Patient Name',
      accessorKey: 'patientName',
      cell({ row }) {
        return (
          <span>
            {findItem(props.appointments, row.original.id)?.patientName}
          </span>
        );
      }
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      cell({ row }) {
        return (
          <span>{findItem(props.appointments, row.original.id)?.date}</span>
        );
      }
    },
    {
      id: 'time',
      header: 'Time',
      accessorKey: 'time',
      cell({ row }) {
        return (
          <span>{findItem(props.appointments, row.original.id)?.time}</span>
        );
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell({ row }) {
        let variant: BadgeVariant = 'default';
        const status = findItem(props.appointments, row.original.id)?.status;

        if (status === 'PENDING') variant = 'outline';
        if (status === 'CONFIRMED') variant = 'secondary';
        if (status === 'CANCELLED') variant = 'destructive';

        return (
          <Badge className="capitalize" variant={variant}>
            {status}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      cell({ row }) {
        return <Menu isHeader={false} id={row.original.id.toString()} />;
      },
      header({ table }) {
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
  ];

  return (
    <div className="grid h-full xl:grid-cols-[1fr_auto] xl:gap-12">
      <section className="flex flex-col gap-8 lg:mx-auto lg:w-10/12">
        {hasPermission(props.user.permissions, 'view:appointments') && (
          <DT.DataTable
            columns={columns}
            data={props.appointments}
            filterConfig={[
              { id: 'date', placeholder: 'Date' },
              { id: 'time', placeholder: 'Time' },
              { id: 'patientName', placeholder: 'Patient Name' }
            ]}
          />
        )}
        <Footer />
      </section>
      <div className="hidden xl:block">
        <Sidebar user={props.user} />
      </div>
    </div>
  );
}
