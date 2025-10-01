import { cn } from '@/lib/utils';

export function CardContent(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='card-content'
      className={cn('px-6', props.className)}
    />
  );
}

export function CardTitle(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='card-title'
      className={cn('leading-none font-semibold', props.className)}
    />
  );
}

export function CardDescription(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='card-description'
      className={cn('text-muted-foreground text-sm', props.className)}
    />
  );
}

export function CardFooter(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='card-footer'
      className={cn('flex items-center px-6 [.border-t]:pt-6', props.className)}
    />
  );
}

export function CardAction(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='card-action'
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        props.className
      )}
    />
  );
}

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='card'
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className
      )}
    />
  );
}

export function CardHeader(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      data-slot='card-header'
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        props.className
      )}
    />
  );
}
