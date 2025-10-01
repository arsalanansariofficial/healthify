'use client';

import { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function TableHeader(props: ComponentProps<'thead'>) {
  return (
    <thead
      {...props}
      data-slot='table-header'
      className={cn('[&_tr]:border-b', props.className)}
    />
  );
}

export function TableBody(props: ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child]:border-0', props.className)}
      {...props}
    />
  );
}

export function TableFooter(props: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      {...props}
      data-slot='table-footer'
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        props.className
      )}
    />
  );
}

export function TableRow(props: ComponentProps<'tr'>) {
  return (
    <tr
      {...props}
      data-slot='table-row'
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        props.className
      )}
    />
  );
}

export function TableCaption(props: ComponentProps<'caption'>) {
  return (
    <caption
      {...props}
      data-slot='table-caption'
      className={cn('text-muted-foreground mt-4 text-sm', props.className)}
    />
  );
}

export function TableHead(props: ComponentProps<'th'>) {
  return (
    <th
      {...props}
      data-slot='table-head'
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        props.className
      )}
    />
  );
}

export function TableCell(props: ComponentProps<'td'>) {
  return (
    <td
      {...props}
      data-slot='table-cell'
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        props.className
      )}
    />
  );
}

export function Table(props: ComponentProps<'table'>) {
  return (
    <div
      data-slot='table-container'
      className='relative w-full overflow-x-auto'
    >
      <table
        {...props}
        data-slot='table'
        className={cn('w-full caption-bottom text-sm', props.className)}
      />
    </div>
  );
}
