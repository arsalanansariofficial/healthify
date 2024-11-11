'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import * as CNP from '@/components/ui/popover';
import * as CMD from '@/components/ui/command';
import { Button } from '@/components/ui/button';

type MultiSelectProps = {
  placeholder?: string;
  selectedValues: string[];
  options: { value: string; label: string }[];
  setSelectedValues: (values: string[]) => void;
};

export default function MultiSelect(props: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(String());

  const filteredOptions = props.options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const allValues = props.options.map(opt => opt.value);
  const allSelected = allValues.every(val =>
    props.selectedValues.includes(val)
  );

  function removeSelected(value: string) {
    props.setSelectedValues(
      props.selectedValues.filter(item => item !== value)
    );
  }

  function toggleSelection(value: string) {
    if (props.selectedValues.includes(value)) {
      return props.setSelectedValues(
        props.selectedValues.filter(item => item !== value)
      );
    }

    props.setSelectedValues([...props.selectedValues, value]);
  }

  function toggleSelectAll() {
    if (allSelected) return props.setSelectedValues([]);
    props.setSelectedValues(allValues);
  }

  return (
    <CNP.Popover open={open} onOpenChange={setOpen}>
      <CNP.PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex h-full min-w-[200px] items-center justify-between px-2 pb-2"
        >
          <div className="flex flex-wrap gap-1">
            {props.selectedValues.length === 0 && (
              <span className="truncate text-gray-500">
                {props.placeholder || 'Select options...'}
              </span>
            )}
            {props.selectedValues.length > 0 &&
              props.selectedValues.map(val => (
                <Badge
                  key={val}
                  className="flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-black dark:bg-gray-700 dark:text-white"
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
                    className="ml-1 cursor-pointer text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </div>
                </Badge>
              ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </CNP.PopoverTrigger>
      <CNP.PopoverContent className="w-[300px] p-0" align="start">
        <CMD.Command>
          <CMD.CommandInput
            value={inputValue}
            placeholder="Search..."
            onValueChange={setInputValue}
          />
          <CMD.CommandList>
            <CMD.CommandItem onSelect={toggleSelectAll}>
              <div className="flex items-center">
                <Check
                  className={cn('mr-2 h-4 w-4 opacity-0', {
                    'opacity-100': allSelected
                  })}
                />
                {allSelected ? 'Deselect All' : 'Select All'}
              </div>
            </CMD.CommandItem>
            {filteredOptions.length === 0 && (
              <CMD.CommandEmpty>No options found.</CMD.CommandEmpty>
            )}
            {filteredOptions.length > 0 &&
              filteredOptions.map(option => {
                const isSelected = props.selectedValues.includes(option.value);
                return (
                  <CMD.CommandItem
                    key={option.value}
                    onSelect={() => toggleSelection(option.value)}
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn('mr-2 h-4 w-4 opacity-0', {
                          'opacity-100': isSelected
                        })}
                      />
                      {option.label}
                    </div>
                  </CMD.CommandItem>
                );
              })}
          </CMD.CommandList>
        </CMD.Command>
      </CNP.PopoverContent>
    </CNP.Popover>
  );
}
