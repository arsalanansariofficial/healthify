'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandInput
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type MultiSelectProps = {
  placeholder?: string;
  selectedValues: string[];
  options: { value: string; label: string }[];
  setSelectedValues: (values: string[]) => void;
};

export default function MultiSelect(props: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState(String());
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  const allValues = useMemo(
    () => props.options.map(opt => opt.value),
    [props.options]
  );

  const allSelected = useMemo(
    () => allValues.every(val => props.selectedValues.includes(val)),
    [allValues, props.selectedValues]
  );

  useEffect(() => {
    if (triggerRef.current) setTriggerWidth(triggerRef.current.offsetWidth);
  }, [props.selectedValues.length]);

  useEffect(() => {
    updateWidth();
    function updateWidth() {
      if (triggerRef.current) setTriggerWidth(triggerRef.current.offsetWidth);
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const removeSelected = useCallback(
    (value: string) => {
      props.setSelectedValues(
        props.selectedValues.filter(item => item !== value)
      );
    },
    [props]
  );

  const toggleSelectAll = useCallback(() => {
    if (allSelected) return props.setSelectedValues([]);
    props.setSelectedValues(allValues);
  }, [allSelected, allValues, props]);

  const filteredOptions = useMemo(
    () =>
      props.options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [inputValue, props.options]
  );

  const toggleSelection = useCallback(
    (value: string) => {
      if (props.selectedValues.includes(value)) {
        return props.setSelectedValues(
          props.selectedValues.filter(item => item !== value)
        );
      }

      props.setSelectedValues([...props.selectedValues, value]);
    },
    [props]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant='outline'
          className='flex h-full min-w-[200px] items-center justify-between px-2 pb-2'
        >
          <div className='flex flex-wrap gap-1'>
            {props.selectedValues.length === 0 && (
              <span className='truncate font-normal text-gray-500'>
                {props.placeholder || 'Select options...'}
              </span>
            )}
            {props.selectedValues.length > 0 &&
              props.selectedValues.map(val => (
                <Badge
                  key={val}
                  className='flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-black capitalize dark:bg-gray-700 dark:text-white'
                >
                  {props.options.find(opt => opt.value === val)?.label}
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      removeSelected(val);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        removeSelected(val);
                      }
                    }}
                    className='ml-1 cursor-pointer text-red-500 hover:text-red-700'
                  >
                    <X className='h-3 w-3' />
                  </div>
                </Badge>
              ))}
          </div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='p-0'
        style={{ width: triggerWidth }}
      >
        <Command>
          <CommandInput
            value={inputValue}
            placeholder='Search...'
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandItem onSelect={toggleSelectAll}>
              <div className='flex items-center'>
                <Check
                  className={cn('mr-2 h-4 w-4 opacity-0', {
                    'opacity-100': allSelected
                  })}
                />
                {allSelected ? 'Deselect All' : 'Select All'}
              </div>
            </CommandItem>
            {filteredOptions.length === 0 && (
              <CommandEmpty>No options found.</CommandEmpty>
            )}
            {filteredOptions.length > 0 &&
              filteredOptions.map(option => {
                const isSelected = props.selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    className='capitalize'
                    onSelect={() => toggleSelection(option.value)}
                  >
                    <div className='flex items-center'>
                      <Check
                        className={cn('mr-2 h-4 w-4 opacity-0', {
                          'opacity-100': isSelected
                        })}
                      />
                      {option.label}
                    </div>
                  </CommandItem>
                );
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
