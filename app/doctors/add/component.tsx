'use client';

import Image from 'next/image';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { DAYS } from '@/lib/constants';
import Footer from '@/components/footer';
import { addDoctor } from '@/lib/actions';
import { doctorSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { arrayBufferToBase64, cn } from '@/lib/utils';
import MultiSelect from '@/components/ui/multi-select';

import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form';

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';

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

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];

      if (!file) return;
      setImage(file);

      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const dataUrl = `data:${file.type};base64,${base64}`;

      setImageSrc(dataUrl);
    },
    []
  );

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      <Card>
        <CardHeader>
          <CardTitle>Add Doctor</CardTitle>
          <CardDescription>
            Add details for the doctor here. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="doctor-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
                        <Label
                          htmlFor="image"
                          className={cn(
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Gwen Tennyson"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your.name@domain.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Secret@123"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+919876543210"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="gender"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                          <SelectValue placeholder="Select a gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="experience"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input
                        min={1}
                        max={100}
                        {...field}
                        type="number"
                        placeholder="Moradabad"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Moradabad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="specialities"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialities</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={specialities}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                        placeholder="Select specialities ..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="daysOfVisit"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Of Visit</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={DAYS}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                        placeholder="Select specialities ..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="timings"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
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
                          <FormMessage />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="doctor-form" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
