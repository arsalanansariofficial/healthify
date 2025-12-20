'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { User } from 'next-auth';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultiSelect from '@/components/ui/multi-select';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import useHookForm from '@/hooks/use-hook-form';
import { addDoctor } from '@/lib/actions';
import { DATES } from '@/lib/constants';
import { doctorSchema } from '@/lib/schemas';
import { arrayBufferToBase64, cn } from '@/lib/utils';

export default function Component({
  specialities
}: {
  user: User;
  specialities: { value: string; label: string }[];
}) {
  const [image, setImage] = useState<File>();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const { handleSubmit, pending } = useHookForm(handler, addDoctor);

  const form = useForm({
    defaultValues: {
      city: String(),
      daysOfVisit: [],
      email: String(),
      experience: 0,
      name: String(),
      password: String(),
      phone: String(),
      specialities: [],
      timings: [{ duration: 1, id: '1', time: '10:00:00' }]
    },
    resolver: zodResolver(doctorSchema)
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
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
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
              className='space-y-2'
              id='doctor-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed'>
                        <Label
                          className={cn(
                            'absolute inset-0 z-10 grid place-items-center',
                            { 'opacity-0': image }
                          )}
                          htmlFor='image'
                        >
                          <FileIcon />
                        </Label>
                        {imageSrc && (
                          <Image
                            alt='Profile Picture'
                            className='aspect-video object-cover'
                            fill
                            src={imageSrc}
                          />
                        )}
                        <Input
                          className='hidden'
                          id='image'
                          name='image'
                          onChange={e => {
                            const files = e.target.files;
                            if (files?.length) {
                              field.onChange(files);
                              handleFileChange(e);
                            }
                          }}
                          type='file'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Gwen Tennyson'
                        type='text'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='your.name@domain.com'
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Secret@123'
                        type='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='+919876543210'
                        type='tel'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                          <SelectValue placeholder='Select a gender' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='male'>Male</SelectItem>
                          <SelectItem value='female'>Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='experience'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input
                        max={100}
                        min={1}
                        {...field}
                        placeholder='Moradabad'
                        type='number'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Moradabad' type='text' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='specialities'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialities</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={specialities}
                        placeholder='Select specialities ...'
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='daysOfVisit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Of Visit</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={[...DATES.DAYS]}
                        placeholder='Select specialities ...'
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='timings'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='grid gap-0.5'>
                        <div className='flex items-center justify-between'>
                          <Label>Time of visit</Label>
                          <Button
                            onClick={() => {
                              field.onChange([
                                ...(field.value ?? []),
                                {
                                  duration: 1,
                                  id: Math.floor(
                                    10000 + Math.random() * 90000
                                  ).toString(),
                                  time: '10:00:00'
                                }
                              ]);
                            }}
                            type='button'
                            variant='ghost'
                          >
                            <PlusIcon className='h-4 w-4' />
                          </Button>
                        </div>
                        <div className='space-y-2'>
                          <ul className='space-y-2'>
                            {field.value.map((time, index) => (
                              <li
                                className='grid grid-cols-[1fr_auto_auto] gap-2'
                                key={time.id}
                              >
                                <Input
                                  className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                                  defaultValue={time.time}
                                  onChange={e => {
                                    const time = field.value.slice();
                                    time[index].time = e.target.value;
                                    field.onChange(time);
                                  }}
                                  step='1'
                                  type='time'
                                />
                                <Input
                                  min={1}
                                  {...field}
                                  onChange={e => {
                                    const time = field.value.slice();
                                    time[index].duration = +e.target.value;
                                    field.onChange(time);
                                  }}
                                  type='number'
                                  value={time.duration}
                                />
                                <Button
                                  disabled={!index}
                                  onClick={() => {
                                    if (index) {
                                      const newTimings = field.value.slice();
                                      newTimings.splice(index, 1);
                                      field.onChange(newTimings);
                                    }
                                  }}
                                  type='button'
                                  variant='ghost'
                                >
                                  <TrashIcon className='h-4 w-4' />
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
          <Button disabled={pending} form='doctor-form' type='submit'>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
