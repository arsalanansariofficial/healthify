import { cn } from '@/lib/utils';

export function CardContent(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('px-6', props.className)}
      data-slot='card-content'
    />
  );
}

export function CardTitle(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('leading-none font-semibold', props.className)}
      data-slot='card-title'
    />
  );
}

export function CardDescription(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('text-muted-foreground text-sm', props.className)}
      data-slot='card-description'
    />
  );
}

export function CardFooter(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('flex items-center px-6 [.border-t]:pt-6', props.className)}
      data-slot='card-footer'
    />
  );
}

export function CardAction(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        props.className
      )}
      data-slot='card-action'
    />
  );
}

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className
      )}
      data-slot='card'
    />
  );
}

export function CardHeader(props: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        props.className
      )}
      data-slot='card-header'
    />
  );
}
