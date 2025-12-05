'use client';

import { Indicator, Root } from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Root>;

export function Checkbox(props: Props) {
  return (
    <Root
      {...props}
      className={cn(
        'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        props.className
      )}
      data-slot='checkbox'>
      <Indicator
        className='flex items-center justify-center text-current transition-none'
        data-slot='checkbox-indicator'>
        <CheckIcon className='size-3.5' />
      </Indicator>
    </Root>
  );
}
