import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('bg-accent animate-pulse rounded-md', className)}
      data-slot='skeleton'
    />
  );
}
