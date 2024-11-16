'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import * as Select from '@/components/ui/select';
import CmdSelect from '@/components/ui/cmd-select';
import MultiSelect from '@/components/ui/multi-select';

const specialities = [
  { value: 'physician', label: 'Physician' },
  { value: 'dentist', label: 'Dentist' }
];

const days = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }
];

export function DoctorForm() {
  const [image, setImage] = useState<File>();
  const [speciality, setSpeciality] = useState(String());
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return window.btoa(
      bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), String())
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];

    if (!file) return;
    setImage(file);

    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const dataUrl = `data:${file.type};base64,${base64}`;

    setImageSrc(dataUrl);
  }

  console.log(image);

  const [timings, setTimings] = useState([
    {
      duration: 1,
      time: '10:00:00',
      id: Math.floor(10000 + Math.random() * 90000)
    }
  ]);

  return (
    <form className="grid gap-4 py-2">
      <div className="relative grid min-h-40 gap-3 overflow-clip rounded-md border-2 border-dashed">
        <Label
          htmlFor="image"
          className={cn('absolute inset-0 z-10 grid place-items-center', {
            'opacity-0': image
          })}
        >
          <FileIcon className="block" />
        </Label>
        {imageSrc && <Image fill alt="Profile Picture" src={imageSrc} />}
        <Input
          id="image"
          type="file"
          name="image"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" type="text" placeholder="Gwen Tennyson" />
      </div>
      <div className="grid gap-3">
        <Label>Speciality</Label>
        <CmdSelect
          options={specialities}
          selected={speciality}
          setSelected={setSpeciality}
          placeholder="Select a speciality"
        />
      </div>
      <div className="grid gap-3">
        <Label>Experience</Label>
        <Input min={1} type="number" id="experience" placeholder="1 year" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="gender">Gender</Label>
        <Select.Select>
          <Select.SelectTrigger
            id="gender"
            className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
          >
            <Select.SelectValue placeholder="Select a gender" />
          </Select.SelectTrigger>
          <Select.SelectContent>
            <Select.SelectItem value="male">Male</Select.SelectItem>
            <Select.SelectItem value="female">Female</Select.SelectItem>
          </Select.SelectContent>
        </Select.Select>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="days-of-visit">Days of visit</Label>
        <MultiSelect
          options={days}
          selectedValues={selectedDays}
          setSelectedValues={setSelectedDays}
          placeholder="Select days of visit..."
        />
      </div>
      <div className="grid gap-0.5">
        <div className="flex items-center justify-between">
          <Label>Time of visit</Label>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setTimings(timings => [
                ...timings,
                {
                  duration: 1,
                  time: '10:00:00',
                  id: Math.floor(10000 + Math.random() * 90000)
                }
              ])
            }
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {timings.map((time, index) => (
            <li key={time.id} className="grid grid-cols-[1fr_auto_auto] gap-2">
              <Input
                step="1"
                type="time"
                defaultValue="10:00:00"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                onChange={e => {
                  setTimings(t => {
                    const time = t.slice();
                    time[index].time = e.target.value;
                    return time;
                  });
                }}
              />
              <Input
                min={1}
                type="number"
                defaultValue="1"
                onChange={e => {
                  setTimings(t => {
                    const time = t.slice();
                    time[index].duration = +e.target.value;
                    return time;
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                disabled={!index}
                onClick={() => {
                  if (index) {
                    setTimings(t => {
                      const newTimings = t.slice();
                      newTimings.splice(index, 1);
                      return newTimings;
                    });
                  }
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}

export default function Page() {
  return (
    <section className="col-span-2 h-full space-y-4 lg:col-span-1">
      <header>
        <CN.Card>
          <CN.CardContent>
            <h1 className="font-semibold">Doctors</h1>
          </CN.CardContent>
        </CN.Card>
      </header>
      <main>
        <CN.Card>
          <CN.CardHeader>
            <CN.CardTitle>Add Doctor</CN.CardTitle>
            <CN.CardDescription>
              Add details for the doctor here. Click save when you&apos;re done.
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardContent>
            <DoctorForm />
          </CN.CardContent>
          <CN.CardFooter>
            <Button type="submit" form="" formAction="">
              Save
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </main>
    </section>
  );
}
