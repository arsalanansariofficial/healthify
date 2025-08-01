'use client';

import * as React from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

type CalendarDayButtonProps = React.ComponentProps<typeof DayButton>;

type Props = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
};

export function CalendarDayButton(props: CalendarDayButtonProps) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (props.modifiers.focused) ref.current?.focus();
  }, [props.modifiers.focused]);

  return (
    <Button
      ref={ref}
      {...props}
      size="icon"
      variant="ghost"
      data-range-end={props.modifiers.range_end}
      data-day={props.day.date.toLocaleDateString()}
      data-range-start={props.modifiers.range_start}
      data-range-middle={props.modifiers.range_middle}
      data-selected-single={
        props.modifiers.selected &&
        !props.modifiers.range_start &&
        !props.modifiers.range_end &&
        !props.modifiers.range_middle
      }
      className={cn(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        props.className
      )}
    />
  );
}

export function Calendar(props: Props) {
  const defaultClassNames = getDefaultClassNames();
  const {
    showOutsideDays = true,
    captionLayout = 'label',
    buttonVariant = 'ghost'
  } = props;

  return (
    <DayPicker
      captionLayout={captionLayout}
      showOutsideDays={showOutsideDays}
      formatters={{
        formatMonthDropdown: date =>
          date.toLocaleString('default', { month: 'short' }),
        ...props.formatters
      }}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        props.className
      )}
      classNames={{
        table: 'w-full border-collapse',
        root: cn('w-fit', defaultClassNames.root),
        weekdays: cn('flex', defaultClassNames.weekdays),
        hidden: cn('invisible', defaultClassNames.hidden),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        month: cn('flex flex-col w-full gap-4', defaultClassNames.month),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
        range_start: cn(
          'rounded-l-md bg-accent',
          defaultClassNames.range_start
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled
        ),
        months: cn(
          'flex gap-4 flex-col md:flex-row relative',
          defaultClassNames.months
        ),
        dropdown: cn(
          'absolute bg-popover inset-0 opacity-0',
          defaultClassNames.dropdown
        ),
        week_number_header: cn(
          'select-none w-(--cell-size)',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-[0.8rem] select-none text-muted-foreground',
          defaultClassNames.week_number
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside
        ),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
          defaultClassNames.nav
        ),
        today: cn(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
          defaultClassNames.today
        ),
        weekday: cn(
          'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
          defaultClassNames.weekday
        ),
        month_caption: cn(
          'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5',
          defaultClassNames.dropdowns
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_next
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_previous
        ),
        dropdown_root: cn(
          'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md',
          defaultClassNames.dropdown_root
        ),
        day: cn(
          'relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none',
          defaultClassNames.day
        ),
        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5',
          defaultClassNames.caption_label
        ),
        ...props.classNames
      }}
      components={{
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),
        Root: ({ className, rootRef, ...props }) => (
          <div
            {...props}
            ref={rootRef}
            data-slot="calendar"
            className={cn(className)}
          />
        ),
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                {...props}
                className={cn('size-4', className)}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          );
        },
        ...props.components
      }}
      {...props}
    />
  );
}
