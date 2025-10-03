'use client';

import {
  Root,
  Corner,
  Viewport,
  ScrollAreaThumb,
  ScrollAreaScrollbar
} from '@radix-ui/react-scroll-area';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

type ScrollAreaProps = React.ComponentProps<typeof Root>;

type ScrollbarProps = React.ComponentProps<typeof ScrollAreaScrollbar>;

export function ScrollBar(props: ScrollbarProps) {
  const { orientation = 'vertical' } = useMemo(() => props, [props]);

  return (
    <ScrollAreaScrollbar
      {...props}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' &&
          'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' &&
          'h-2.5 flex-col border-t border-t-transparent',
        props.className
      )}
      data-slot='scroll-area-scrollbar'
      orientation={orientation}
    >
      <ScrollAreaThumb
        className='bg-border relative flex-1 rounded-full'
        data-slot='scroll-area-thumb'
      />
    </ScrollAreaScrollbar>
  );
}

export function ScrollArea(props: ScrollAreaProps) {
  return (
    <Root
      {...props}
      className={cn('relative', props.className)}
      data-slot='scroll-area'
    >
      <Viewport
        className='focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1'
        data-slot='scroll-area-viewport'
      >
        {props.children}
      </Viewport>
      <ScrollBar />
      <Corner />
    </Root>
  );
}
