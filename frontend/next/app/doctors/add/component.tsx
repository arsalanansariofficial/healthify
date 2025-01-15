'use client';

import Image from 'next/image';
import { toast } from 'sonner';
import { useActionState, useState } from 'react';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';

import * as utils from '@/lib/utils';
import { DAYS } from '@/lib/constants';
import { addDoctor } from '@/lib/actions';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import * as Select from '@/components/ui/select';
import MultiSelect from '@/components/ui/multi-select';

export type Props = { specialities: { value: string; label: string }[] };

export default function Component({ specialities }: Props) {
  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    formData.set('gender', gender);
    formData.set('image', image ? (image as File) : String());
    formData.set('daysOfVisit', JSON.stringify(selectedDays));
    formData.set('specialities', JSON.stringify(selectedSpecialities));
    formData.set(
      'timings',
      JSON.stringify(utils.removeDuplicateTimes(timings))
    );

    const result = await addDoctor(prevState, formData);

    if (result?.success) {
      toast(result.message, {
        position: 'top-center',
        description: <span className="text-foreground">{utils.getDate()}</span>
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className="text-destructive">{result?.message}</h2>, {
        position: 'top-center',
        description: <p className="text-destructive">{utils.getDate()}</p>
      });
    }

    return result;
  }, undefined);

  const [image, setImage] = useState<File>();
  const [gender, setGender] = useState<string>('male');
  const [experience, setExperience] = useState<number>();
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];

    if (!file) return;
    setImage(file);

    const arrayBuffer = await file.arrayBuffer();
    const base64 = utils.arrayBufferToBase64(arrayBuffer);
    const dataUrl = `data:${file.type};base64,${base64}`;

    setImageSrc(dataUrl);
  }

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
            <form id="doctor-form" className={'grid gap-4'}>
              <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
                <Label
                  htmlFor="image"
                  className={utils.cn(
                    'absolute inset-0 z-10 grid place-items-center',
                    {
                      'opacity-0': image
                    }
                  )}
                >
                  <FileIcon />
                </Label>
                {imageSrc && (
                  <Image
                    fill
                    src={imageSrc}
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
                  defaultValue={state?.name}
                />
                {state?.errors?.name && (
                  <p className="text-destructive text-xs">
                    {state.errors.name}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={state?.email}
                  placeholder="your.name@domain.com"
                />
                {state?.errors?.email && (
                  <p className="text-destructive text-xs">
                    {state.errors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Secret@123"
                  defaultValue={state?.password}
                />
                {state?.errors?.password && (
                  <p className="text-destructive text-xs">
                    {state.errors.password}
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
                  defaultValue={state?.phone}
                />
                {state?.errors?.phone && (
                  <p className="text-destructive text-xs">
                    {state.errors.phone}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Moradabad"
                  defaultValue={state?.city}
                />
                {state?.errors?.city && (
                  <p className="text-destructive text-xs">
                    {state.errors.city}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label>Specialities</Label>
                <MultiSelect
                  options={specialities}
                  placeholder="Select specialities ..."
                  selectedValues={selectedSpecialities}
                  setSelectedValues={setSelectedSpecialities}
                />
                {state?.errors?.specialities && (
                  <p className="text-destructive text-xs">
                    {state.errors.specialities}
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
                  key={state?.experience}
                  defaultValue={state?.experience}
                  onBlur={() => setExperience(undefined)}
                  onChange={e => setExperience(+e.target.value)}
                  autoFocus={
                    !!state?.experience && state.experience === experience
                  }
                />
                {state?.errors?.experience && (
                  <p className="text-destructive text-xs">
                    {state.errors.experience}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="gender">Gender</Label>
                <Select.Select defaultValue={gender} onValueChange={setGender}>
                  <Select.SelectTrigger
                    id={gender}
                    className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                  >
                    <Select.SelectValue placeholder="Select a gender" />
                  </Select.SelectTrigger>
                  <Select.SelectContent>
                    <Select.SelectItem value="male">Male</Select.SelectItem>
                    <Select.SelectItem value="female">Female</Select.SelectItem>
                  </Select.SelectContent>
                </Select.Select>
                {state?.errors?.gender && (
                  <p className="text-destructive text-xs">
                    {state.errors.gender}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="days-of-visit">Days of visit</Label>
                <MultiSelect
                  options={DAYS}
                  selectedValues={selectedDays}
                  setSelectedValues={setSelectedDays}
                  placeholder="Select days of visit..."
                />
                {state?.errors?.daysOfVisit && (
                  <p className="text-destructive text-xs">
                    {state.errors.daysOfVisit}
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
                <div className="space-y-2">
                  <ul className="space-y-2">
                    {timings.map((time, index) => (
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
                          defaultValue={time.duration}
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
                  {state?.errors?.timings && (
                    <p className="text-destructive text-xs">
                      {state.errors.timings}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </CN.CardContent>
          <CN.CardFooter>
            <Button
              type="submit"
              form="doctor-form"
              disabled={pending}
              formAction={action}
            >
              {pending ? 'Saving...' : 'Save'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </main>
    </section>
  );
}
