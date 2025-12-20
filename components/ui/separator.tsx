'use client';

import { Root } from '@radix-ui/react-separator';

import { cn } from '@/lib/utils';

type props = React.ComponentProps<typeof Root>;

export function Separator(props: props) {
  const { decorative = true, orientation = 'horizontal' } = props;
  return (
    <Root
      {...props}
      data-slot='separator'
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        props.className
      )}
    />
  );
}
