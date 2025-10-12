'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Day, TimeSlot, User } from '@prisma/client';
import { CalendarIcon } from 'lucide-react';
import { User as AuthUser } from 'next-auth';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { getAppointment } from '@/lib/actions';
import { DATES } from '@/lib/constants';
import { appointmentSchema } from '@/lib/schemas';
import { formatTime, getDate } from '@/lib/utils';

export default function Component({
  doctor,
  user
}: {
  doctor: User & { timings: TimeSlot[] };
  user: AuthUser;
}) {
  const { handleSubmit, pending } = useHookForm(
    handler,
    getAppointment.bind(null, doctor.id) as (data: unknown) => Promise<unknown>
  );

  const form = useForm({
    defaultValues: {
      city: user.city || String(),
      date: new Date(),
      email: user.email || String(),
      name: user.name || String(),
      notes: String(),
      phone: user.phone || String(),
      time: String()
    },
    resolver: zodResolver(appointmentSchema)
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Get Appointment</CardTitle>
          <CardDescription>
            Enter the details below to book an appointment with the doctor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='appointment-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className='space-y-2'>
                <Label htmlFor='doctor-name'>Doctor</Label>
                <Input
                  className='capitalize'
                  name='doctor-name'
                  placeholder='Gwen Tennyson'
                  readOnly
                  type='text'
                  value={doctor.name as string}
                />
              </div>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='capitalize'
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
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='capitalize'
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
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            className='data-[empty=true]:text-muted-foreground flex justify-between text-left font-normal'
                            data-empty={!field.value}
                            variant='outline'
                          >
                            {field.value &&
                              getDate(field.value.toString(), false, false)}
                            {!field.value && <span>Pick a date</span>}
                            <CalendarIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                          <Calendar
                            disabled={date =>
                              !doctor.daysOfVisit.includes(
                                date.toLocaleDateString('en-US', {
                                  weekday: 'long'
                                }) as Day
                              )
                            }
                            hidden={{
                              after: DATES.MAX_DATE as Date,
                              before: DATES.MIN_DATE as Date
                            }}
                            mode='single'
                            onSelect={field.onChange}
                            selected={field.value}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='time'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                          <SelectValue placeholder='Select a time' />
                        </SelectTrigger>
                        <SelectContent>
                          {doctor.timings.map(time => (
                            <SelectItem
                              className='capitalize'
                              key={time.id}
                              value={time.id}
                            >
                              {formatTime(time.time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        className='capitalize'
                        {...{ ...field, value: field.value as string }}
                        placeholder='Any prior medical history or symptoms...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button disabled={pending} form='appointment-form' type='submit'>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
