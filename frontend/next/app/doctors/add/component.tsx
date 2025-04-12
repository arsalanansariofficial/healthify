'use client';

import Image from 'next/image';
import { useState } from 'react';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';

import * as utils from '@/lib/utils';
import { DAYS } from '@/lib/constants';
import Footer from '@/components/footer';
import { addDoctor } from '@/lib/actions';
import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { doctorSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import * as Select from '@/components/ui/select';
import handler from '@/components/display-toast';
import MultiSelect from '@/components/ui/multi-select';

export type Props = {
  user: User;
  specialities: { value: string; label: string }[];
};

export default function Component({ specialities }: Props) {
  const [image, setImage] = useState<File>();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const { pending, handleSubmit } = useHookForm(handler, addDoctor);

  const form = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      experience: 0,
      name: String(),
      city: String(),
      email: String(),
      daysOfVisit: [],
      phone: String(),
      specialities: [],
      password: String(),
      timings: [{ id: '1', time: '10:00:00', duration: 1 }]
    }
  });

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
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      <CN.Card>
        <CN.CardHeader>
          <CN.CardTitle>Add Doctor</CN.CardTitle>
          <CN.CardDescription>
            Add details for the doctor here. Click save when you&apos;re done.
          </CN.CardDescription>
        </CN.CardHeader>
        <CN.CardContent>
          <RHF.Form {...form}>
            <form
              id="doctor-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormControl>
                      <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
                        <Label
                          htmlFor="image"
                          className={utils.cn(
                            'absolute inset-0 z-10 grid place-items-center',
                            { 'opacity-0': image }
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
                          onChange={e => {
                            const files = e.target.files;
                            if (files?.length) {
                              field.onChange(files);
                              handleFileChange(e);
                            }
                          }}
                        />
                      </div>
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Name</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Gwen Tennyson"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Email</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your.name@domain.com"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Password</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Secret@123"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Phone</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+919876543210"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="gender"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Gender</RHF.FormLabel>
                    <RHF.FormControl>
                      <Select.Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                          <Select.SelectValue placeholder="Select a gender" />
                        </Select.SelectTrigger>
                        <Select.SelectContent>
                          <Select.SelectItem value="male">
                            Male
                          </Select.SelectItem>
                          <Select.SelectItem value="female">
                            Female
                          </Select.SelectItem>
                        </Select.SelectContent>
                      </Select.Select>
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="experience"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Experience</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input
                        min={1}
                        max={100}
                        {...field}
                        type="number"
                        placeholder="Moradabad"
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>City</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input {...field} type="text" placeholder="Moradabad" />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="specialities"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Specialities</RHF.FormLabel>
                    <RHF.FormControl>
                      <MultiSelect
                        options={specialities}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                        placeholder="Select specialities ..."
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="daysOfVisit"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Days Of Visit</RHF.FormLabel>
                    <RHF.FormControl>
                      <MultiSelect
                        options={DAYS}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                        placeholder="Select specialities ..."
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="timings"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormControl>
                      <div className="grid gap-0.5">
                        <div className="flex items-center justify-between">
                          <Label>Time of visit</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              field.onChange([
                                ...(field.value ?? []),
                                {
                                  duration: 1,
                                  time: '10:00:00',
                                  id: Math.floor(
                                    10000 + Math.random() * 90000
                                  ).toString()
                                }
                              ]);
                            }}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <ul className="space-y-2">
                            {field.value.map((time, index) => (
                              <li
                                key={time.id}
                                className="grid grid-cols-[1fr_auto_auto] gap-2"
                              >
                                <Input
                                  step="1"
                                  type="time"
                                  defaultValue={time.time}
                                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                  onChange={e => {
                                    const time = field.value.slice();
                                    time[index].time = e.target.value;
                                    field.onChange(time);
                                  }}
                                />
                                <Input
                                  min={1}
                                  {...field}
                                  type="number"
                                  value={time.duration}
                                  onChange={e => {
                                    const time = field.value.slice();
                                    time[index].duration = +e.target.value;
                                    field.onChange(time);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  disabled={!index}
                                  onClick={() => {
                                    if (index) {
                                      const newTimings = field.value.slice();
                                      newTimings.splice(index, 1);
                                      field.onChange(newTimings);
                                    }
                                  }}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <RHF.FormMessage />
                        </div>
                      </div>
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
            </form>
          </RHF.Form>
        </CN.CardContent>
        <CN.CardFooter>
          <Button type="submit" form="doctor-form" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
      <Footer />
    </div>
  );
}
