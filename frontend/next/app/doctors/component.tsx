'use client';

import z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { Speciality, TimeSlot } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';

import * as actions from '@/lib/actions';
import Footer from '@/components/footer';
import * as CN from '@/components/ui/card';
import { nameSchema } from '@/lib/schemas';
import Sidebar from '@/components/sidebar';
import * as RHF from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import * as CND from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import { User as Doctor } from '@prisma/client';
import * as Drawer from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import * as Select from '@/components/ui/select';
import handler from '@/components/display-toast';

type TCVProps<T extends z.ZodType> = { item: z.infer<T> };

type Props = {
  user: User;
  specialities: Speciality[];
  doctors: (Doctor & {
    timings: TimeSlot[];
    UserSpecialities: {
      speciality: { name: string };
    }[];
  })[];
};

export function TableCellViewer<T extends z.ZodType>(props: TCVProps<T>) {
  const isMobile = useIsMobile();

  const { pending, handleSubmit } = useHookForm(
    handler,
    actions.updateSpeciality.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: String() }
  });

  return (
    <Drawer.Drawer direction={isMobile ? 'bottom' : 'right'}>
      <Drawer.DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant="link" className="text-foreground px-0">
          {props.item.id}
        </Button>
      </Drawer.DrawerTrigger>
      <Drawer.DrawerContent>
        <Drawer.DrawerHeader className="gap-1">
          <Drawer.DrawerTitle>Speciality</Drawer.DrawerTitle>
          <Drawer.DrawerDescription>
            You can change the name for the selected speciality
          </Drawer.DrawerDescription>
        </Drawer.DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <RHF.Form {...form}>
            <form
              id="speciality-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Speciality</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input {...field} type="name" placeholder="Physician" />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
            </form>
          </RHF.Form>
        </div>
        <Drawer.DrawerFooter>
          <Button
            type="submit"
            disabled={pending}
            form="speciality-form"
            className="cursor-pointer"
          >
            {pending ? 'Saving...' : 'Save'}
          </Button>
          <Drawer.DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </Drawer.DrawerClose>
        </Drawer.DrawerFooter>
      </Drawer.DrawerContent>
    </Drawer.Drawer>
  );
}

export default function Component(props: Props) {
  const [, setTime] = useState<string>();
  const [, setGender] = useState<string>();
  const [, setSpeciality] = useState<string>();
  const [, setExperience] = useState<string>();

  return (
    <div className="grid h-full xl:grid-cols-[1fr_auto] xl:gap-12">
      <section className="flex flex-col gap-8 lg:mx-auto lg:w-10/12">
        <form action="" className="grid grid-cols-[1fr_auto_auto] gap-2">
          <Input
            type="text"
            name="name"
            id="doctor-name"
            className="w-full"
            placeholder="Search doctor..."
          />
          <CND.Dialog>
            <div>
              <CND.DialogTrigger asChild>
                <Button className="block w-full">Filter</Button>
              </CND.DialogTrigger>
              <CND.DialogContent className="sm:max-w-[425px]">
                <CND.DialogHeader>
                  <CND.DialogTitle>Apply Filters</CND.DialogTitle>
                  <CND.DialogDescription>
                    Find doctors based on your preferences.
                  </CND.DialogDescription>
                </CND.DialogHeader>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-speciality">Speciality</Label>
                    <Select.Select onValueChange={setSpeciality}>
                      <Select.SelectTrigger
                        id="doctor-speciality"
                        className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                      >
                        <Select.SelectValue placeholder="Select a speciality" />
                      </Select.SelectTrigger>
                      <Select.SelectContent>
                        <Select.SelectItem value="physician">
                          Physician
                        </Select.SelectItem>
                        <Select.SelectItem value="dentist">
                          Dentist
                        </Select.SelectItem>
                      </Select.SelectContent>
                    </Select.Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-experience">Experience</Label>
                    <Select.Select onValueChange={setExperience}>
                      <Select.SelectTrigger
                        id="doctor-experience"
                        className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                      >
                        <Select.SelectValue placeholder="Select experience in years" />
                      </Select.SelectTrigger>
                      <Select.SelectContent>
                        <Select.SelectItem value="1">1 year</Select.SelectItem>
                        <Select.SelectItem value="2">2 Years</Select.SelectItem>
                        <Select.SelectItem value="3">3 Years</Select.SelectItem>
                        <Select.SelectItem value="4">4 Years</Select.SelectItem>
                        <Select.SelectItem value="5">5 Years</Select.SelectItem>
                        <Select.SelectItem value="Infinity">
                          More than 5 Years
                        </Select.SelectItem>
                      </Select.SelectContent>
                    </Select.Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-gender">Gender</Label>
                    <Select.Select onValueChange={setGender}>
                      <Select.SelectTrigger
                        id="doctor-gender"
                        className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                      >
                        <Select.SelectValue placeholder="Select a gender" />
                      </Select.SelectTrigger>
                      <Select.SelectContent>
                        <Select.SelectItem value="male">Male</Select.SelectItem>
                        <Select.SelectItem value="female">
                          Female
                        </Select.SelectItem>
                      </Select.SelectContent>
                    </Select.Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-time">Time</Label>
                    <Select.Select onValueChange={setTime}>
                      <Select.SelectTrigger
                        id="doctor-time"
                        className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                      >
                        <Select.SelectValue placeholder="Select a time" />
                      </Select.SelectTrigger>
                      <Select.SelectContent>
                        <Select.SelectItem value="morning">
                          Morning
                        </Select.SelectItem>
                        <Select.SelectItem value="evening">
                          Evening
                        </Select.SelectItem>
                      </Select.SelectContent>
                    </Select.Select>
                  </div>
                </form>
                <CND.DialogFooter>
                  <CND.DialogClose asChild>
                    <Button variant="outline">Reset</Button>
                  </CND.DialogClose>
                  <Button type="submit">Filter</Button>
                </CND.DialogFooter>
              </CND.DialogContent>
            </div>
          </CND.Dialog>
        </form>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15em,1fr))] gap-4">
          {props.doctors.map(doctor => (
            <li key={doctor.id}>
              <CN.Card className="rounded-md py-3">
                <CN.CardContent className="space-y-3 px-3">
                  <div className="relative min-h-40 overflow-hidden rounded-md">
                    <Image
                      fill
                      priority
                      alt={doctor.name as string}
                      src={`/users/${doctor.image}` || '/users/user.png'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {doctor.timings.map(t => (
                      <li key={t.id}>
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold capitalize"
                        >
                          {t.time}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-3">
                      <span className="block text-xs leading-none font-semibold capitalize">
                        {doctor.gender}
                      </span>
                      <h2 className="font-serif text-sm leading-none font-semibold capitalize underline underline-offset-2">
                        {doctor.name}
                      </h2>
                      <ul className="flex flex-wrap gap-2">
                        {doctor.UserSpecialities.map(({ speciality }) => (
                          <li key={speciality.name}>
                            <Badge
                              variant="outline"
                              className="text-xs font-semibold capitalize"
                            >
                              {speciality.name.toLowerCase()}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold capitalize"
                    >
                      {doctor.experience} Years
                    </Badge>
                  </div>
                  <Button asChild className="mt-4 block w-full cursor-pointer">
                    <Link
                      className="text-center"
                      href={`/appointments/${doctor.id}`}
                    >
                      Get Appointment
                    </Link>
                  </Button>
                </CN.CardContent>
              </CN.Card>
            </li>
          ))}
        </ul>
        <Footer />
      </section>
      <div className="hidden xl:block">
        <Sidebar user={props.user} />
      </div>
    </div>
  );
}
