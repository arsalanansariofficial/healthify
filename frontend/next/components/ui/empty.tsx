import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    defaultVariants: { variant: 'default' },
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
      }
    }
  }
);

export function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='empty'
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12',
        className
      )}
    />
  );
}

export function EmptyHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='empty-header'
      className={cn(
        'flex max-w-sm flex-col items-center gap-2 text-center',
        className
      )}
    />
  );
}

export function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      {...props}
      data-slot='empty-icon'
      data-variant={variant}
      className={cn(emptyMediaVariants({ className, variant }))}
    />
  );
}

export function EmptyTitle({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='empty-title'
      className={cn('text-lg font-medium tracking-tight', className)}
    />
  );
}

export function EmptyDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <div
      {...props}
      data-slot='empty-description'
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
        className
      )}
    />
  );
}

export function EmptyContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='empty-content'
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
        className
      )}
    />
  );
}
