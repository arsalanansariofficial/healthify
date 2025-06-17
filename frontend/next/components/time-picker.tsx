'use client';

import { useMemo } from 'react';
import { format, parse, setHours, setMinutes } from 'date-fns';

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';

type Props = {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
};

export function TimePicker({ value, onChange, label }: Props) {
  const date = useMemo(() => {
    if (!value) return new Date(2024, 0, 1, 12, 0, 0);
    return parse(value, 'HH:mm:ss', new Date());
  }, [value]);

  const hours12 = format(date, 'hh');
  const minutes = format(date, 'mm');
  const period = format(date, 'a') as 'AM' | 'PM';

  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    format(setHours(date, i + 1), 'hh')
  );

  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  function update(
    newHours?: string,
    newMinutes?: string,
    newPeriod?: 'AM' | 'PM'
  ) {
    const hrs = Number(newHours ?? hours12);
    const mins = Number(newMinutes ?? minutes);
    const meridiem = newPeriod ?? period;

    let h24 = hrs % 12;
    if (meridiem === 'PM') h24 += 12;

    let newDate = setHours(date, h24);
    newDate = setMinutes(newDate, mins);

    onChange(format(newDate, 'HH:mm:ss'));
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm leading-none font-medium">{label}</label>
      )}
      <div className="flex gap-2">
        <Select
          value={hours12}
          onValueChange={value => update(value, undefined, undefined)}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map(h => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={minutes}
          onValueChange={value => update(undefined, value, undefined)}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {minuteOptions.map(m => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={period}
          onValueChange={value =>
            update(undefined, undefined, value as 'AM' | 'PM')
          }
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
