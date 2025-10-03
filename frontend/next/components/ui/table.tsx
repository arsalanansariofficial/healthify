'use client';

import { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function TableHeader(props: ComponentProps<'thead'>) {
  return (
    <thead
      {...props}
      className={cn('[&_tr]:border-b', props.className)}
      data-slot='table-header'
    />
  );
}

export function TableBody(props: ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0', props.className)}
      data-slot='table-body'
      {...props}
    />
  );
}

export function TableFooter(props: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      {...props}
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        props.className
      )}
      data-slot='table-footer'
    />
  );
}

export function TableRow(props: ComponentProps<'tr'>) {
  return (
    <tr
      {...props}
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        props.className
      )}
      data-slot='table-row'
    />
  );
}

export function TableCaption(props: ComponentProps<'caption'>) {
  return (
    <caption
      {...props}
      className={cn('text-muted-foreground mt-4 text-sm', props.className)}
      data-slot='table-caption'
    />
  );
}

export function TableHead(props: ComponentProps<'th'>) {
  return (
    <th
      {...props}
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        props.className
      )}
      data-slot='table-head'
    />
  );
}

export function TableCell(props: ComponentProps<'td'>) {
  return (
    <td
      {...props}
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        props.className
      )}
      data-slot='table-cell'
    />
  );
}

export function Table(props: ComponentProps<'table'>) {
  return (
    <div
      className='relative w-full overflow-x-auto'
      data-slot='table-container'
    >
      <table
        {...props}
        className={cn('w-full caption-bottom text-sm', props.className)}
        data-slot='table'
      />
    </div>
  );
}
