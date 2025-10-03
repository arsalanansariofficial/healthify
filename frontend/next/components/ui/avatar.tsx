import { Root, Image, Fallback } from '@radix-ui/react-avatar';
import { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Avatar({ className, ...props }: ComponentProps<typeof Root>) {
  return (
    <Root
      {...props}
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      data-slot='avatar'
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: ComponentProps<typeof Image>) {
  return (
    <Image
      {...props}
      alt='avatar-image'
      className={cn('aspect-square size-full', className)}
      data-slot='avatar-image'
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof Fallback>) {
  return (
    <Fallback
      {...props}
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className
      )}
      data-slot='avatar-fallback'
    />
  );
}
