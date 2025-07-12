'use client';

import z from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Speciality } from '@prisma/client';
import * as RT from '@tanstack/react-table';
import * as Icons from '@tabler/icons-react';

import { getDate } from '@/lib/utils';
import * as actions from '@/lib/actions';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import * as Drawer from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import * as DT from '@/components/ui/data-table';
import * as DM from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

type Props = { specialities: Speciality[] };
type TableSchema = { id: number; name: string };
type TCVProps<T extends z.ZodType> = { item: z.infer<T> };
type MenuProps = { id?: string; ids?: string[]; isHeader: boolean };

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
                success: '🎉 Speciality deleted successfully.',
                error: (
                  <span className="text-destructive">
                    ⚠️ Something went wrong!
                  </span>
                )
              });
            }

            if (isHeader) {
              toast.promise(actions.deleteSpecialities(ids as string[]), {
                position: 'top-center',
                loading: 'Deleting specialities',
                success: '🎉 Specialities deleted successfully.',
                error: (
                  <span className="text-destructive">
                    ⚠️ Something went wrong!
                  </span>
                )
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
  const router = useRouter();
  const isMobile = useIsMobile();

  const [state, action, pending] = useActionState(
    async function (prevState: unknown, formData: FormData) {
      const result = await actions.updateSpeciality(
        props.item.id,
        prevState,
        formData
      );

      if (result?.success) {
        toast(result.message, {
          position: 'top-center',
          onAutoClose: router.refresh,
          description: <span className="text-foreground">{getDate()}</span>
        });
      }

      if (!result?.success && result?.message) {
        toast(<h2 className="text-destructive">{result?.message}</h2>, {
          position: 'top-center',
          description: <p className="text-destructive">{getDate()}</p>
        });
      }

      return result;
    },
    {
      name: props.item.name,
      email: props.item.email,
      emailVerfied: props.item.emailVerified
    } as actions.FormState
  );

  return (
    <Drawer.Drawer direction={isMobile ? 'bottom' : 'right'}>
      <Drawer.DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant="link" className="text-foreground px-0">
          {props.item.id}
        </Button>
      </Drawer.DrawerTrigger>
      <Drawer.DrawerContent>
        <Drawer.DrawerHeader className="gap-1">
          <Drawer.DrawerTitle>Users Chart</Drawer.DrawerTitle>
          <Drawer.DrawerDescription>
            Showing total users for the last 6 months
          </Drawer.DrawerDescription>
        </Drawer.DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form id="speciality-form" className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={state?.name}
                placeholder="Gwen Tennyson"
              />
            </div>
          </form>
        </div>
        <Drawer.DrawerFooter>
          <Button
            type="submit"
            disabled={pending}
            formAction={action}
            form="speciality-form"
            className="cursor-pointer"
          >
            {pending ? 'Saving...' : 'Save'}
          </Button>
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
      cell: ({ row }) => <DT.DragHandle id={row.original.id} />
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
      id: 'id',
      header: 'Id',
      accessorKey: 'id',
      cell: ({ row }) => (
        <TableCellViewer
          key={Date.now()}
          item={props.specialities.find(s => s.id === String(row.original.id))}
        />
      )
    },
    {
      id: 'name',
      header: 'Name',
      enableHiding: false,
      accessorKey: 'name'
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
  ];

  return (
    <div className="col-span-2 space-y-4 lg:col-start-2">
      <section className="space-y-4">
        <CN.Card className="grid min-h-[calc(100vh-10.5em)] grid-rows-[1fr_auto] gap-4">
          <CN.CardHeader>
            <DT.DataTable
              columns={columns}
              data={props.specialities}
              filterConfig={[{ id: 'name', placeholder: 'Name' }]}
            />
          </CN.CardHeader>
          <CN.CardFooter>
            <Button variant="link" className="mx-auto">
              <Link href="/specialities/add">
                Want to create a new speciality?
              </Link>
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </section>
    </div>
  );
}
