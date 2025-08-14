'use client';

import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { User as AuthUser } from 'next-auth';
import { Day, TimeSlot, User } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
import { formatTime } from '@/lib/utils';
import * as CN from '@/components/ui/card';
import Sidebar from '@/components/sidebar';
import * as RHF from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as PO from '@/components/ui/popover';
import { getAppointment } from '@/lib/actions';
import useHookForm from '@/hooks/use-hook-form';
import { Button } from '@/components/ui/button';
import handler from '@/components/display-toast';
import * as Select from '@/components/ui/select';
import { appointmentSchema } from '@/lib/schemas';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { MIN_DATE, MAX_DATE } from '@/lib/constants';

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
    <div className="grid h-full xl:grid-cols-[1fr_auto] xl:gap-12">
      <section className="flex flex-col gap-8 lg:mx-auto lg:w-10/12">
        <section className="col-span-2 h-full space-y-4 xl:col-span-1 xl:col-start-2">
          <CN.Card>
            <CN.CardHeader>
              <CN.CardTitle>Get Appointment</CN.CardTitle>
              <CN.CardDescription>
                Enter the details below to book an appointment with the doctor.
              </CN.CardDescription>
            </CN.CardHeader>
            <CN.CardContent>
              <RHF.Form {...form}>
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
                    name="city"
                    control={form.control}
                    render={({ field }) => (
                      <RHF.FormItem>
                        <RHF.FormLabel>City</RHF.FormLabel>
                        <RHF.FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Moradabad"
                          />
                        </RHF.FormControl>
                        <RHF.FormMessage />
                      </RHF.FormItem>
                    )}
                  />
                  <RHF.FormField
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                      <RHF.FormItem>
                        <RHF.FormLabel>Day</RHF.FormLabel>
                        <RHF.FormControl>
                          <PO.Popover>
                            <PO.PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                data-empty={!field.value}
                                className="data-[empty=true]:text-muted-foreground flex justify-between text-left font-normal"
                              >
                                {field.value && format(field.value, 'PPP')}
                                {!field.value && <span>Pick a date</span>}
                                <CalendarIcon />
                              </Button>
                            </PO.PopoverTrigger>
                            <PO.PopoverContent className="w-auto p-0">
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
                            </PO.PopoverContent>
                          </PO.Popover>
                        </RHF.FormControl>
                        <RHF.FormMessage />
                      </RHF.FormItem>
                    )}
                  />
                  <RHF.FormField
                    name="time"
                    control={form.control}
                    render={({ field }) => (
                      <RHF.FormItem>
                        <RHF.FormLabel>Time</RHF.FormLabel>
                        <RHF.FormControl>
                          <Select.Select onValueChange={field.onChange}>
                            <Select.SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                              <Select.SelectValue placeholder="Select a time" />
                            </Select.SelectTrigger>
                            <Select.SelectContent>
                              {doctor.timings.map(time => (
                                <Select.SelectItem
                                  key={time.id}
                                  value={time.id}
                                  className="capitalize"
                                >
                                  {formatTime(time.time)}
                                </Select.SelectItem>
                              ))}
                            </Select.SelectContent>
                          </Select.Select>
                        </RHF.FormControl>
                        <RHF.FormMessage />
                      </RHF.FormItem>
                    )}
                  />
                  <RHF.FormField
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                      <RHF.FormItem>
                        <RHF.FormLabel>Notes</RHF.FormLabel>
                        <RHF.FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any prior medical history or symptoms..."
                          />
                        </RHF.FormControl>
                        <RHF.FormMessage />
                      </RHF.FormItem>
                    )}
                  />
                </form>
              </RHF.Form>
            </CN.CardContent>
            <CN.CardFooter>
              <Button type="submit" form="appointment-form" disabled={pending}>
                {pending ? 'Saving...' : 'Save'}
              </Button>
            </CN.CardFooter>
          </CN.Card>
        </section>
        <Footer />
      </section>
      <div className="hidden xl:block">
        <Sidebar user={user} />
      </div>
    </div>
  );
}
