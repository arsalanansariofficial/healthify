'use client';

import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
  KeyboardSensor,
  type DragEndEvent,
  type UniqueIdentifier
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconChevronLeft,
  IconGripVertical,
  IconChevronsLeft,
  IconChevronRight,
  IconLayoutColumns,
  IconChevronsRight
} from '@tabler/icons-react';
import {
  type Row,
  flexRender,
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  getFacetedRowModel,
  getFilteredRowModel,
  type VisibilityState,
  getPaginationRowModel,
  getFacetedUniqueValues,
  type ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useId, useState, useMemo, useEffect, ReactNode } from 'react';
import { useDebounce } from 'use-debounce';

import { TimePicker } from '@/components/time-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent
} from '@/components/ui/select';
import {
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableHeader
} from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { getDate } from '@/lib/utils';

export function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      size='icon'
      {...listeners}
      {...attributes}
      className='text-muted-foreground size-7 hover:bg-transparent'
      variant='ghost'>
      <IconGripVertical className='text-muted-foreground size-3' />
      <span className='sr-only'>Drag to reorder</span>
    </Button>
  );
}

export function DraggableRow<T extends { id: string }>(props: { row: Row<T> }) {
  const { row } = props;
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: row.original.id
  });

  return (
    <TableRow
      className='relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
      data-dragging={isDragging}
      data-state={row.getIsSelected() && 'selected'}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}>
      {row.getVisibleCells().map(cell => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<T extends { id: string }>(props: {
  data: T[];
  button?: ReactNode;
  columns: ColumnDef<T>[];
  filterConfig: {
    id: string;
    placeholder: string;
    type?: 'text' | 'number' | 'date' | 'time';
  }[];
}) {
  const sortableId = useId();
  const [data, setData] = useState(() => props.data);

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const table = useReactTable({
    columns: props.columns,
    data,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: row => row.id.toString(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
      sorting
    }
  });

  const [filterValues, setFilterValues] = useState(() =>
    props.filterConfig.reduce(
      (acc, filter) => {
        acc[filter.id] =
          (table.getColumn(filter.id)?.getFilterValue() as string) ?? String();
        return acc;
      },
      {} as Record<string, string | Date>
    )
  );

  const [debouncedFilterValues] = useDebounce(filterValues, 300);

  useEffect(() => {
    Object.entries(debouncedFilterValues).forEach(([id, value]) => {
      table.getColumn(id)?.setFilterValue(value);
    });
  }, [debouncedFilterValues, table]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id)
      setData(data => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
  }

  return (
    <Tabs
      className='w-full flex-col justify-start gap-6'
      defaultValue='outline'>
      <div className='flex justify-between gap-2'>
        <div className='grid auto-cols-auto grid-flow-col gap-2'>
          {props.filterConfig.map(filter => {
            const value = filterValues[filter.id] ?? '';

            if (filter.type && filter.type === 'time')
              return (
                <TimePicker
                  key={filter.id}
                  onChange={val =>
                    setFilterValues(prev => ({ ...prev, [filter.id]: val }))
                  }
                  value={value as string}
                />
              );

            if (filter.type && filter.type === 'date')
              return (
                <Popover key={filter.id}>
                  <PopoverTrigger asChild>
                    <Button
                      className='data-[empty=true]:text-muted-foreground flex justify-between text-left font-normal'
                      data-empty={!value}
                      variant='outline'>
                      {value && format(value, 'PPP')}
                      {!value && <span>Pick a date</span>}
                      <CalendarIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      onSelect={value =>
                        setFilterValues(prev => ({
                          ...prev,
                          [filter.id]: getDate(value?.toString())
                        }))
                      }
                      selected={value as Date}
                    />
                    <Button
                      className='w-full text-red-500'
                      onClick={() =>
                        setFilterValues(prev => ({ ...prev, [filter.id]: '' }))
                      }
                      size='sm'
                      variant='ghost'>
                      Clear
                    </Button>
                  </PopoverContent>
                </Popover>
              );

            return (
              <Input
                className='max-w-sm'
                key={filter.id}
                name={filter.id}
                onChange={e =>
                  setFilterValues(prev => ({
                    ...prev,
                    [filter.id]: e.target.value
                  }))
                }
                placeholder={filter.placeholder}
                value={(filterValues[filter.id] as string) ?? ''}
              />
            );
          })}
        </div>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='h-full' size='sm' variant='outline'>
                <IconLayoutColumns />
                <span className='hidden lg:inline'>Customize Columns</span>
                <span className='lg:hidden'>Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              {table
                .getAllColumns()
                .filter(
                  column =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide()
                )
                .map(column => (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className='capitalize'
                    key={column.id}
                    onCheckedChange={value =>
                      column.toggleVisibility(Boolean(value))
                    }>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {props.button}
        </div>
      </div>
      <TabsContent
        className='relative flex flex-col gap-4 overflow-auto'
        value='outline'>
        <div className='overflow-hidden rounded-lg border'>
          <DndContext
            collisionDetection={closestCenter}
            id={sortableId}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}>
            <Table>
              <TableHeader className='bg-muted sticky top-0 z-10'>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead colSpan={header.colSpan} key={header.id}>
                        {!header.isPlaceholder &&
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className='**:data-[slot=table-cell]:first:w-8'>
                {table.getRowModel().rows?.length === 0 && (
                  <TableRow>
                    <TableCell
                      className='text-center'
                      colSpan={props.columns.length}>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
                {table.getRowModel().rows?.length > 0 && (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map(row => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className='px-4- flex items-center justify-between'>
          <div className='text-muted-foreground hidden flex-1 text-sm lg:flex'>
            {table.getFilteredSelectedRowModel().rows.length} of&nbsp;
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className='flex w-full items-center gap-8 lg:w-fit'>
            <div className='hidden items-center gap-2 lg:flex'>
              <Label className='text-sm font-medium' htmlFor='rows-per-page'>
                Rows per page
              </Label>
              <Select
                onValueChange={value => {
                  table.setPageSize(Number(value));
                }}
                value={`${table.getState().pagination.pageSize}`}>
                <SelectTrigger className='w-20' id='rows-per-page' size='sm'>
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side='top'>
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex w-fit items-center justify-center text-sm font-medium'>
              Page {table.getState().pagination.pageIndex + 1} of&nbsp;
              {table.getPageCount()}
            </div>
            <div className='ml-auto flex items-center gap-2 lg:ml-0'>
              <Button
                className='hidden h-8 w-8 p-0 lg:flex'
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
                variant='outline'>
                <span className='sr-only'>Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                className='size-8'
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size='icon'
                variant='outline'>
                <span className='sr-only'>Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                className='size-8'
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size='icon'
                variant='outline'>
                <span className='sr-only'>Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                className='hidden size-8 lg:flex'
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                size='icon'
                variant='outline'>
                <span className='sr-only'>Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
