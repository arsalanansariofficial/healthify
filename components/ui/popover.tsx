'use client';

import {
  Root,
  Anchor,
  Portal,
  Trigger,
  Content
} from '@radix-ui/react-popover';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

type PopoverProps = React.ComponentProps<typeof Root>;
type PopoverAnchorProps = React.ComponentProps<typeof Anchor>;

type PopoverContentProps = React.ComponentProps<typeof Content>;

type PopoverTriggerProps = React.ComponentProps<typeof Trigger>;

export function Popover(props: PopoverProps) {
  return <Root data-slot='popover' {...props} />;
}

export function PopoverAnchor(props: PopoverAnchorProps) {
  return <Anchor data-slot='popover-anchor' {...props} />;
}

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <Trigger data-slot='popover-trigger' {...props} />;
}

export function PopoverContent(props: PopoverContentProps) {
  const { align = 'center', sideOffset = 4 } = useMemo(() => props, [props]);

  return (
    <Portal>
      <Content
        {...props}
        align={align}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          props.className
        )}
        data-slot='popover-content'
        sideOffset={sideOffset}
      />
    </Portal>
  );
}
