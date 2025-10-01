import { ComponentProps } from 'react';
import { Root, Image, Fallback } from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

export function Avatar({ className, ...props }: ComponentProps<typeof Root>) {
  return (
    <Root
      {...props}
      data-slot='avatar'
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
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
      data-slot='avatar-image'
      className={cn('aspect-square size-full', className)}
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
      data-slot='avatar-fallback'
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className
      )}
    />
  );
}
