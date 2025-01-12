'use client';

import Image from 'next/image';
import { toast } from 'sonner';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useActionState, useState } from 'react';

import { cn, getDate } from '@/lib/utils';
import { DoctorProps } from '@/lib/types';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import * as Select from '@/components/ui/select';
import { FormState, signup } from '@/lib/actions';
import MultiSelect from '@/components/ui/multi-select';

const days = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }
];

type Timings = { duration: number; time: string; id: number }[];

type FormProps = {
  className?: string;
  selectedDays: string[];
  image: File | undefined;
  imageSrc: string | null;
  gender: string | undefined;
  state: FormState | undefined;
  selectedSpecialities: string[];
  specialities: DoctorProps['specialities'];
  setGender: Dispatch<SetStateAction<string>>;
  setSelectedDays: Dispatch<SetStateAction<string[]>>;
  setImage: Dispatch<SetStateAction<File | undefined>>;
  setImageSrc: Dispatch<SetStateAction<string | null>>;
  timings: { duration: number; time: string; id: number }[];
  setSelectedSpecialities: Dispatch<SetStateAction<string[]>>;
  setTimings: Dispatch<
    SetStateAction<{ duration: number; time: string; id: number }[]>
  >;
};

function removeDuplicateTimes(timings: Timings) {
  const timeSet = new Set();

  return timings.filter(item => {
    if (timeSet.has(item.time)) return false;
    timeSet.add(item.time);
    return true;
  });
}

export function useDoctorForm() {
  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    formData.set('gender', gender);
    formData.set('image', image ? (image as File) : String());
    formData.set('daysOfVisit', JSON.stringify(selectedDays));
    formData.set('specialities', JSON.stringify(selectedSpecialities));
    formData.set('timings', JSON.stringify(removeDuplicateTimes(timings)));

    const result = await signup(prevState, formData);

    if (result?.success) {
      toast(result.message, {
        position: 'top-center',
        description: <span className="text-foreground">{getDate()}</span>
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className="text-destructive">{result?.message}</h2>, {
        position: 'top-center',
        description: <p className="text-destructive">{getDate()}</p>
      });
    }

    return result;
  }, undefined);

  const [image, setImage] = useState<File>();
  const [gender, setGender] = useState<string>('male');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>(
    []
  );

  const [timings, setTimings] = useState([
    {
      duration: 1,
      time: '10:00:00',
      id: Math.floor(10000 + Math.random() * 90000)
    }
  ]);

  return {
    image,
    state,
    gender,
    action,
    pending,
    timings,
    setImage,
    imageSrc,
    setGender,
    setTimings,
    setImageSrc,
    selectedDays,
    setSelectedDays,
    selectedSpecialities,
    setSelectedSpecialities
  };
}

export function DoctorForm(props: FormProps) {
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return window.btoa(
      bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), String())
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];

    if (!file) return;
    props.setImage(file);

    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const dataUrl = `data:${file.type};base64,${base64}`;

    props.setImageSrc(dataUrl);
  }

  const [experience, setExperience] = useState<number>();

  return (
    <form id="doctor-form" className={cn('grid gap-4', props.className)}>
      <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
        <Label
          htmlFor="image"
          className={cn('absolute inset-0 z-10 grid place-items-center', {
            'opacity-0': props.image
          })}
        >
          <FileIcon />
        </Label>
        {props.imageSrc && (
          <Image
            fill
            src={props.imageSrc}
            alt="Profile Picture"
            className="aspect-video object-cover"
          />
        )}
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
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Gwen Tennyson"
          defaultValue={props.state?.name}
        />
        {props.state?.errors?.name && (
          <p className="text-destructive text-xs">{props.state.errors.name}</p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={props.state?.email}
          placeholder="your.name@domain.com"
        />
        {props.state?.errors?.email && (
          <p className="text-destructive text-xs">{props.state.errors.email}</p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Secret@123"
          defaultValue={props.state?.password}
        />
        {props.state?.errors?.password && (
          <p className="text-destructive text-xs">
            {props.state.errors.password}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          name="phone"
          placeholder="+919876543210"
          defaultValue={props.state?.phone}
        />
        {props.state?.errors?.phone && (
          <p className="text-destructive text-xs">{props.state.errors.phone}</p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          type="text"
          placeholder="Moradabad"
          defaultValue={props.state?.city}
        />
        {props.state?.errors?.city && (
          <p className="text-destructive text-xs">{props.state.errors.city}</p>
        )}
      </div>
      <div className="grid gap-3">
        <Label>Specialities</Label>
        <MultiSelect
          options={props.specialities}
          placeholder="Select specialities ..."
          selectedValues={props.selectedSpecialities}
          setSelectedValues={props.setSelectedSpecialities}
        />
        {props.state?.errors?.specialities && (
          <p className="text-destructive text-xs">
            {props.state.errors.specialities}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="experience">Experience</Label>
        <Input
          min={1}
          max={100}
          type="number"
          id="experience"
          name="experience"
          placeholder="1 year"
          key={props.state?.experience}
          defaultValue={props.state?.experience}
          onBlur={() => setExperience(undefined)}
          onChange={e => setExperience(+e.target.value)}
          autoFocus={
            !!props.state?.experience && props.state.experience === experience
          }
        />
        {props.state?.errors?.experience && (
          <p className="text-destructive text-xs">
            {props.state.errors.experience}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="gender">Gender</Label>
        <Select.Select
          defaultValue={props.gender}
          onValueChange={props.setGender}
        >
          <Select.SelectTrigger
            id={props.gender}
            className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
          >
            <Select.SelectValue placeholder="Select a gender" />
          </Select.SelectTrigger>
          <Select.SelectContent>
            <Select.SelectItem value="male">Male</Select.SelectItem>
            <Select.SelectItem value="female">Female</Select.SelectItem>
          </Select.SelectContent>
        </Select.Select>
        {props.state?.errors?.gender && (
          <p className="text-destructive text-xs">
            {props.state.errors.gender}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="days-of-visit">Days of visit</Label>
        <MultiSelect
          options={days}
          selectedValues={props.selectedDays}
          setSelectedValues={props.setSelectedDays}
          placeholder="Select days of visit..."
        />
        {props.state?.errors?.daysOfVisit && (
          <p className="text-destructive text-xs">
            {props.state.errors.daysOfVisit}
          </p>
        )}
      </div>
      <div className="grid gap-0.5">
        <div className="flex items-center justify-between">
          <Label>Time of visit</Label>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              props.setTimings(timings => [
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
        <div className="space-y-2">
          <ul className="space-y-2">
            {props.timings.map((time, index) => (
              <li
                key={time.id}
                className="grid grid-cols-[1fr_auto_auto] gap-2"
              >
                <Input
                  step="1"
                  type="time"
                  defaultValue="10:00:00"
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  onChange={e => {
                    props.setTimings(t => {
                      const time = t.slice();
                      time[index].time = e.target.value;
                      return time;
                    });
                  }}
                />
                <Input
                  min={1}
                  type="number"
                  defaultValue={time.duration}
                  onChange={e => {
                    props.setTimings(t => {
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
                      props.setTimings(t => {
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
          {props.state?.errors?.timings && (
            <p className="text-destructive text-xs">
              {props.state.errors.timings}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

export default function Component({ specialities }: DoctorProps) {
  const props = useDoctorForm();

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
            <DoctorForm
              image={props.image}
              state={props.state}
              gender={props.gender}
              timings={props.timings}
              imageSrc={props.imageSrc}
              setImage={props.setImage}
              specialities={specialities}
              setGender={props.setGender}
              setTimings={props.setTimings}
              setImageSrc={props.setImageSrc}
              selectedDays={props.selectedDays}
              setSelectedDays={props.setSelectedDays}
              selectedSpecialities={props.selectedSpecialities}
              setSelectedSpecialities={props.setSelectedSpecialities}
            />
          </CN.CardContent>
          <CN.CardFooter>
            <Button
              type="submit"
              form="doctor-form"
              disabled={props.pending}
              formAction={props.action}
            >
              {props.pending ? 'Saving...' : 'Save'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </main>
    </section>
  );
}
