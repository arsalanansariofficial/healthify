'use client';

import { Check } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';

type CmdProps = {
  selected: string;
  placeholder?: string;
  setSelected: (value: string) => void;
  options: { value: string; label: string }[];
};

export default function CmdSelect(props: CmdProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState(String());
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  const filteredOptions = useMemo(
    () =>
      props.options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [inputValue, props.options]
  );

  useEffect(() => {
    updateWidth();
    function updateWidth() {
      if (triggerRef.current) setTriggerWidth(triggerRef.current.offsetWidth);
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant='outline'
          className='w-full items-center justify-between px-2 pb-2'
        >
          {props.selected ? (
            <span className='truncate font-normal'>
              {props.options.find(opt => opt.value === props.selected)?.label}
            </span>
          ) : (
            <span className='text-primary/50 truncate font-normal'>
              {props.placeholder || 'Select option...'}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='p-0'
        align='start'
        style={{ width: triggerWidth }}
      >
        <Command>
          <CommandInput
            value={inputValue}
            placeholder='Search...'
            onValueChange={setInputValue}
          />
          <CommandList>
            {filteredOptions.length === 0 && (
              <CommandEmpty>No options found.</CommandEmpty>
            )}
            {filteredOptions.map(option => {
              const isSelected = props.selected === option.value;
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    setOpen(false);
                    props.setSelected(option.value);
                  }}
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
