'use client';

import { z } from 'zod';
import * as React from 'react';
import * as Core from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import * as RT from '@tanstack/react-table';
import * as Icons from '@tabler/icons-react';
import * as Sortable from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import * as Tabs from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as Table from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import * as Select from '@/components/ui/select';
import * as DM from '@/components/ui/dropdown-menu';

type DraggableRowProps<T extends z.ZodType> = { row: RT.Row<z.infer<T>> };

type DataTableProps<T extends z.ZodType> = {
  data: z.infer<T>[];
  columns: RT.ColumnDef<z.infer<T>>[];
};

export function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = Sortable.useSortable({ id });

  return (
    <Button
      size="icon"
      {...listeners}
      {...attributes}
      variant="ghost"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <Icons.IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export function DraggableRow<T extends z.ZodType>(props: DraggableRowProps<T>) {
  const { row } = props;
  const { transform, transition, setNodeRef, isDragging } =
    Sortable.useSortable({
      id: row.original.id
    });

  return (
    <Table.TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition
      }}
    >
      {row.getVisibleCells().map(cell => (
        <Table.TableCell key={cell.id}>
          {RT.flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Table.TableCell>
      ))}
    </Table.TableRow>
  );
}

export function DataTable<T extends z.ZodType>(props: DataTableProps<T>) {
  const sortableId = React.useId();
  const [data, setData] = React.useState(() => props.data);

  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<RT.SortingState>([]);

  const [columnFilters, setColumnFilters] =
    React.useState<RT.ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<RT.VisibilityState>({});

  const dataIds = React.useMemo<Core.UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });

  const sensors = Core.useSensors(
    Core.useSensor(Core.MouseSensor, {}),
    Core.useSensor(Core.TouchSensor, {}),
    Core.useSensor(Core.KeyboardSensor, {})
  );

  const table = RT.useReactTable({
    data,
    columns: props.columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getRowId: row => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: RT.getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: RT.getSortedRowModel(),
    getFacetedRowModel: RT.getFacetedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: RT.getFilteredRowModel(),
    getPaginationRowModel: RT.getPaginationRowModel(),
    getFacetedUniqueValues: RT.getFacetedUniqueValues()
  });

  function handleDragEnd(event: Core.DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData(data => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return Sortable.arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs.Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="grid grid-flow-col gap-2">
          <Input
            name="name"
            className="max-w-sm"
            placeholder="Filter names..."
            value={
              (table.getColumn('name')?.getFilterValue() as string) ?? String()
            }
            onChange={event =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
          />
          <Input
            name="email"
            className="max-w-sm"
            placeholder="Filter emails..."
            value={
              (table.getColumn('email')?.getFilterValue() as string) ?? String()
            }
            onChange={event =>
              table.getColumn('email')?.setFilterValue(event.target.value)
            }
          />
        </div>
        <Tabs.TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <Tabs.TabsTrigger value="outline">Outline</Tabs.TabsTrigger>
          <Tabs.TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger value="focus-documents">
            Focus Documents
          </Tabs.TabsTrigger>
        </Tabs.TabsList>
        <div className="flex items-center gap-2">
          <DM.DropdownMenu>
            <DM.DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Icons.IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <Icons.IconChevronDown />
              </Button>
            </DM.DropdownMenuTrigger>
            <DM.DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  column =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide()
                )
                .map(column => {
                  return (
                    <DM.DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DM.DropdownMenuCheckboxItem>
                  );
                })}
            </DM.DropdownMenuContent>
          </DM.DropdownMenu>
        </div>
      </div>
      <Tabs.TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Core.DndContext
            id={sortableId}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={Core.closestCenter}
            modifiers={[restrictToVerticalAxis]}
          >
            <Table.Table>
              <Table.TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map(headerGroup => (
                  <Table.TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <Table.TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                        >
                          {!header.isPlaceholder &&
                            RT.flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </Table.TableHead>
                      );
                    })}
                  </Table.TableRow>
                ))}
              </Table.TableHeader>
              <Table.TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length === 0 && (
                  <Table.TableRow>
                    <Table.TableCell
                      className="text-center"
                      colSpan={props.columns.length}
                    >
                      No results.
                    </Table.TableCell>
                  </Table.TableRow>
                )}
                {table.getRowModel().rows?.length > 0 && (
                  <Sortable.SortableContext
                    items={dataIds}
                    strategy={Sortable.verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map(row => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </Sortable.SortableContext>
                )}
              </Table.TableBody>
            </Table.Table>
          </Core.DndContext>
        </div>
        <div className="px-4- flex items-center justify-between">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of&nbsp;
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select.Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={value => {
                  table.setPageSize(Number(value));
                }}
              >
                <Select.SelectTrigger
                  size="sm"
                  className="w-20"
                  id="rows-per-page"
                >
                  <Select.SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </Select.SelectTrigger>
                <Select.SelectContent side="top">
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <Select.SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </Select.SelectItem>
                  ))}
                </Select.SelectContent>
              </Select.Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of&nbsp;
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
              >
                <span className="sr-only">Go to first page</span>
                <Icons.IconChevronsLeft />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <Icons.IconChevronLeft />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <Icons.IconChevronRight />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="hidden size-8 lg:flex"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              >
                <span className="sr-only">Go to last page</span>
                <Icons.IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </Tabs.TabsContent>
    </Tabs.Tabs>
  );
}
