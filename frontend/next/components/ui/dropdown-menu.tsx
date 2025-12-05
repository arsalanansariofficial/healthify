'use client';

import {
  Sub,
  Item,
  Root,
  Group,
  Label,
  Portal,
  Content,
  Trigger,
  RadioItem,
  Separator,
  RadioGroup,
  SubContent,
  SubTrigger,
  CheckboxItem,
  ItemIndicator
} from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type DropdownMenuProps = ComponentProps<typeof Root>;
type DropdownMenuSubProps = ComponentProps<typeof Sub>;
type DropdownMenuShortcutProps = ComponentProps<'span'>;
type DropdownMenuGroupProps = ComponentProps<typeof Group>;
type DropdownMenuPortalProps = ComponentProps<typeof Portal>;
type DropdownMenuTriggerProps = ComponentProps<typeof Trigger>;
type DropdownMenuContentProps = ComponentProps<typeof Content>;
type DropdownMenuRadioItemProps = ComponentProps<typeof RadioItem>;
type DropdownMenuSeparatorProps = ComponentProps<typeof Separator>;
type DropDownMenuRadioGroupProps = ComponentProps<typeof RadioGroup>;
type DropdownMenuSubContentProps = ComponentProps<typeof SubContent>;
type DropdownMenuCheckboxItemProps = ComponentProps<typeof CheckboxItem>;

type DropdownMenuLabelProps = ComponentProps<typeof Label> & {
  inset?: boolean;
};

type DropdownMenuSubTriggerProps = ComponentProps<typeof SubTrigger> & {
  inset?: boolean;
};

type DropDownMenuItemProps = ComponentProps<typeof Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
};

export function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <Sub data-slot='dropdown-menu-sub' {...props} />;
}

export function DropdownMenu(props: DropdownMenuProps) {
  return <Root data-slot='dropdown-menu' {...props} />;
}

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <Group data-slot='dropdown-menu-group' {...props} />;
}

export function DropdownMenuPortal(props: DropdownMenuPortalProps) {
  return <Portal data-slot='dropdown-menu-portal' {...props} />;
}

export function DropdownMenuRadioGroup(props: DropDownMenuRadioGroupProps) {
  return <RadioGroup {...props} data-slot='dropdown-menu-radio-group' />;
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <Trigger {...props} data-slot='dropdown-menu-trigger' />;
}

export function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  return (
    <Separator
      {...props}
      className={cn('bg-border -mx-1 my-1 h-px', props.className)}
      data-slot='dropdown-menu-separator'
    />
  );
}

export function DropdownMenuLabel(props: DropdownMenuLabelProps) {
  return (
    <Label
      {...props}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        props.className
      )}
      data-inset={props.inset}
      data-slot='dropdown-menu-label'
    />
  );
}

export function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
  return (
    <span
      {...props}
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        props.className
      )}
      data-slot='dropdown-menu-shortcut'
    />
  );
}

export function DropdownMenuSubContent(props: DropdownMenuSubContentProps) {
  return (
    <SubContent
      {...props}
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg',
        props.className
      )}
      data-slot='dropdown-menu-sub-content'
    />
  );
}

export function DropdownMenuSubTrigger(props: DropdownMenuSubTriggerProps) {
  return (
    <SubTrigger
      {...props}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8',
        props.className
      )}
      data-inset={props.inset}
      data-slot='dropdown-menu-sub-trigger'>
      {props.children}
      <ChevronRightIcon className='ml-auto size-4' />
    </SubTrigger>
  );
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { sideOffset = 4 } = props;
  return (
    <Portal>
      <Content
        {...props}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
          props.className
        )}
        data-slot='dropdown-menu-content'
        sideOffset={sideOffset}
      />
    </Portal>
  );
}

export function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  return (
    <CheckboxItem
      {...props}
      checked={props.checked}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.className
      )}
      data-slot='dropdown-menu-checkbox-item'>
      <span className='pointer-events-none absolute left-2 flex size-3.5 items-center justify-center'>
        <ItemIndicator>
          <CheckIcon className='size-4' />
        </ItemIndicator>
      </span>
      {props.children}
    </CheckboxItem>
  );
}

export function DropdownMenuItem(props: DropDownMenuItemProps) {
  const { variant = 'default' } = props;
  return (
    <Item
      {...props}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.className
      )}
      data-inset={props.inset}
      data-slot='dropdown-menu-item'
      data-variant={variant}
    />
  );
}

export function DropdownMenuRadioItem(props: DropdownMenuRadioItemProps) {
  return (
    <RadioItem
      {...props}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.className
      )}
      data-slot='dropdown-menu-radio-item'>
      <span className='pointer-events-none absolute left-2 flex size-3.5 items-center justify-center'>
        <ItemIndicator>
          <CircleIcon className='size-2 fill-current' />
        </ItemIndicator>
      </span>
      {props.children}
    </RadioItem>
  );
}
