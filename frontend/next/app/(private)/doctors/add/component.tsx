'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';

import AvatarUpload from '@/components/avatar-upload';
import CoverUpload from '@/components/cover-upload';
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

export default function Component({
  specialities
}: {
  user: User;
  specialities: { value: string; label: string }[];
}) {
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
              className='relative space-y-2'
              id='doctor-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='cover'
                render={({ field }) => (
                  <CoverUpload
                    className='h-80'
                    onImageChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <AvatarUpload
                    className='absolute top-[calc(theme(spacing.80)-7rem)] left-4 size-24'
                    onFileChange={field.onChange}
                  />
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
                        {...{ ...field, value: field.value as number }}
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
                      <Input
                        {...{ ...field, value: field.value as string }}
                        placeholder='Moradabad'
                        type='text'
                      />
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
                                  value={time.duration as number}
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
