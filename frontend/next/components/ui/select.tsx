'use client';

import {
  Item,
  Root,
  Icon,
  Label,
  Value,
  Portal,
  Content,
  Trigger,
  ItemText,
  Viewport,
  Separator,
  ItemIndicator,
  ScrollUpButton,
  ScrollDownButton
} from '@radix-ui/react-select';
import { Group, CheckIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type SelectProps = React.ComponentProps<typeof Root>;
type SelectItemProps = React.ComponentProps<typeof Item>;
type SelectGroupProps = React.ComponentProps<typeof Group>;
type SelectValueProps = React.ComponentProps<typeof Value>;
type SelectLabelProps = React.ComponentProps<typeof Label>;
type SelectContentProps = React.ComponentProps<typeof Content>;

type SelectSeparatorProps = React.ComponentProps<typeof Separator>;

type SelectScrollUpProps = React.ComponentProps<typeof ScrollUpButton>;

type SelectScrollDownProps = React.ComponentProps<typeof ScrollDownButton>;

type SelectTriggerProps = React.ComponentProps<typeof Trigger> & {
  size?: 'sm' | 'default';
};

export function Select({ ...props }: SelectProps) {
  return <Root data-slot='select' {...props} />;
}

export function SelectGroup({ ...props }: SelectGroupProps) {
  return <Group data-slot='select-group' {...props} />;
}

export function SelectValue({ ...props }: SelectValueProps) {
  return <Value data-slot='select-value' {...props} />;
}

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <Label
      {...props}
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      data-slot='select-label'
    />
  );
}

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <Separator
      {...props}
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      data-slot='select-separator'
    />
  );
}

export function SelectScrollDownButton(props: SelectScrollDownProps) {
  return (
    <ScrollDownButton
      {...props}
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        props.className
      )}
      data-slot='select-scroll-down-button'>
      <ChevronDownIcon className='size-4' />
    </ScrollDownButton>
  );
}

export function SelectScrollUpButton(props: SelectScrollUpProps) {
  return (
    <ScrollUpButton
      {...props}
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        props.className
      )}
      data-slot='select-scroll-up-button'>
      <ChevronUpIcon className='size-4' />
    </ScrollUpButton>
  );
}

export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <Item
      {...props}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      data-slot='select-item'>
      <span className='absolute right-2 flex size-3.5 items-center justify-center'>
        <ItemIndicator>
          <CheckIcon className='size-4' />
        </ItemIndicator>
      </span>
      <ItemText>{children}</ItemText>
    </Item>
  );
}

export function SelectTrigger({
  size = 'default',
  ...props
}: SelectTriggerProps) {
  return (
    <Trigger
      {...props}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.className
      )}
      data-size={size}
      data-slot='select-trigger'>
      {props.children}
      <Icon asChild>
        <ChevronDownIcon className='size-4 opacity-50' />
      </Icon>
    </Trigger>
  );
}

export function SelectContent({
  position = 'popper',
  ...props
}: SelectContentProps) {
  return (
    <Portal>
      <Content
        {...props}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          props.className
        )}
        data-slot='select-content'
        position={position}>
        <SelectScrollUpButton />
        <Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}>
          {props.children}
        </Viewport>
        <SelectScrollDownButton />
      </Content>
    </Portal>
  );
}
