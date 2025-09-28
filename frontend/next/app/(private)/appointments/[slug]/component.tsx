'use client';

import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { User as AuthUser } from 'next-auth';
import { Day, TimeSlot, User } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
import { formatTime } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAppointment } from '@/lib/actions';
import useHookForm from '@/hooks/use-hook-form';
import { Button } from '@/components/ui/button';
import handler from '@/components/display-toast';
import { appointmentSchema } from '@/lib/schemas';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { MIN_DATE, MAX_DATE } from '@/lib/constants';

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

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

type Props = { doctor: User & { timings: TimeSlot[] }; user: AuthUser };

export default function Component({ doctor, user }: Props) {
  const { pending, handleSubmit } = useHookForm(
    handler,
    getAppointment.bind(null, doctor.id) as (data: unknown) => Promise<unknown>
  );

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      time: String(),
      date: new Date(),
      city: user.city || String(),
      name: user.name || String(),
      phone: user.phone || String(),
      email: user.email || String()
    }
  });

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
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
              id="appointment-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="space-y-2">
                <Label htmlFor="doctor-name">Doctor</Label>
                <Input
                  readOnly
                  type="text"
                  name="doctor-name"
                  placeholder="Gwen Tennyson"
                  value={doctor.name as string}
                />
              </div>
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
                name="date"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            data-empty={!field.value}
                            className="data-[empty=true]:text-muted-foreground flex justify-between text-left font-normal"
                          >
                            {field.value && format(field.value, 'PPP')}
                            {!field.value && <span>Pick a date</span>}
                            <CalendarIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            hidden={{ before: MIN_DATE, after: MAX_DATE }}
                            disabled={date => {
                              const day = date.toLocaleDateString('en-US', {
                                weekday: 'long'
                              });
                              return !doctor.daysOfVisit
                                .map(d => d.toLowerCase())
                                .includes(day.toLowerCase() as Day);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="time"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctor.timings.map(time => (
                            <SelectItem
                              key={time.id}
                              value={time.id}
                              className="capitalize"
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
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any prior medical history or symptoms..."
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
          <Button type="submit" form="appointment-form" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
