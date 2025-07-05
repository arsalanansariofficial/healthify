'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import * as CNP from '@/components/ui/popover';
import * as CMD from '@/components/ui/command';
import { Button } from '@/components/ui/button';

type CmdProps = {
  selected: string;
  placeholder?: string;
  setSelected: (values: string) => void;
  options: { value: string; label: string }[];
};

export default function CmdSelect(props: CmdProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(String());

  const filteredOptions = props.options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <CNP.Popover open={open} onOpenChange={setOpen}>
      <CNP.PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full items-center justify-between px-2 pb-2"
        >
          {props.selected && (
            <span className="truncate font-normal">{props.selected}</span>
          )}
          {!props.selected && (
            <span className="text-primary/50 truncate font-normal">
              {props.placeholder || 'Select option...'}
            </span>
          )}
        </Button>
      </CNP.PopoverTrigger>
      <CNP.PopoverContent className="p-0" align="start">
        <CMD.Command>
          <CMD.CommandInput
            value={inputValue}
            placeholder="Search..."
            onValueChange={setInputValue}
          />
          <CMD.CommandList>
            {filteredOptions.length === 0 && (
              <CMD.CommandEmpty>No options found.</CMD.CommandEmpty>
            )}
            {filteredOptions.length > 0 &&
              filteredOptions.map(option => (
                <CMD.CommandItem
                  key={option.value}
                  onSelect={() => {
                    setOpen(false);
                    props.setSelected(option.value);
                  }}
                >
                  <div className="flex items-center">
                    <Check className={cn('mr-2 h-4 w-4 opacity-0')} />
                    {option.label}
                  </div>
                </CMD.CommandItem>
              ))}
          </CMD.CommandList>
        </CMD.Command>
      </CNP.PopoverContent>
    </CNP.Popover>
  );
}
