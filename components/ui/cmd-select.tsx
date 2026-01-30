'use client';

import { Check } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className='w-full items-center justify-between px-2 pb-2'
          ref={triggerRef}
          variant='outline'>
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
        align='start'
        className='p-0'
        style={{ width: triggerWidth }}>
        <Command>
          <CommandInput
            onValueChange={setInputValue}
            placeholder='Search...'
            value={inputValue}
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
                  }}>
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
