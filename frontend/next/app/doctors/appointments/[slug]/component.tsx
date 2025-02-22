'use client';

import { useForm } from 'react-hook-form';
import { TimeSlot, User } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';

import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAppointment } from '@/lib/actions';
import useHookForm from '@/hooks/use-hook-form';
import { Button } from '@/components/ui/button';
import handler from '@/components/display-toast';
import * as Select from '@/components/ui/select';
import { appointmentSchema } from '@/lib/schemas';

type NewType = { doctor: User & { timings: TimeSlot[] } };

export default function Component({ doctor }: NewType) {
  const { pending, handleSubmit } = useHookForm(handler, getAppointment);

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      day: String(),
      name: String(),
      city: String(),
      time: String(),
      email: String(),
      phone: String()
    }
  });

  return (
    <section className="h-full space-y-4">
      <header>
        <CN.Card>
          <CN.CardContent>
            <h1 className="font-semibold">Appointments</h1>
          </CN.CardContent>
        </CN.Card>
      </header>
      <main>
        <CN.Card className="min-w-sm">
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
                    disabled
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
                        <Input {...field} type="text" placeholder="Moradabad" />
                      </RHF.FormControl>
                      <RHF.FormMessage />
                    </RHF.FormItem>
                  )}
                />
                <RHF.FormField
                  name="day"
                  control={form.control}
                  render={({ field }) => (
                    <RHF.FormItem>
                      <RHF.FormLabel>Day</RHF.FormLabel>
                      <RHF.FormControl>
                        <Select.Select onValueChange={field.onChange}>
                          <Select.SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                            <Select.SelectValue placeholder="Select a day" />
                          </Select.SelectTrigger>
                          <Select.SelectContent>
                            {doctor.daysOfVisit.map(day => (
                              <Select.SelectItem
                                key={day}
                                value={day}
                                className="capitalize"
                              >
                                {day}
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
                                value={time.time}
                                className="capitalize"
                              >
                                {time.time}
                              </Select.SelectItem>
                            ))}
                          </Select.SelectContent>
                        </Select.Select>
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
      </main>
    </section>
  );
}
