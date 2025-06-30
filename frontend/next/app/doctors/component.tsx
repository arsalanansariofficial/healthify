'use client';

import z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { getHours, parse } from 'date-fns';
import { useDebounce } from 'use-debounce';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Speciality, TimeSlot, User as Doctor } from '@prisma/client';

import { HOST } from '@/lib/constants';
import Footer from '@/components/footer';
import { formatTime } from '@/lib/utils';
import { nameSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';
import handler from '@/components/display-toast';
import { updateSpeciality } from '@/lib/actions';
import { Card, CardContent } from '@/components/ui/card';

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
  FormMessage,
  FormControl
} from '@/components/ui/form';

import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription
} from '@/components/ui/dialog';

import {
  Drawer,
  DrawerClose,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
  DrawerContent,
  DrawerDescription
} from '@/components/ui/drawer';

type TCVProps<T extends z.ZodType> = { item: z.infer<T> };

type Props = {
  user: User;
  specialities: Speciality[];
  doctors: (Doctor & {
    timings: TimeSlot[];
    UserSpecialities: { speciality: { name: string } }[];
  })[];
};

export function TableCellViewer<T extends z.ZodType>(props: TCVProps<T>) {
  const isMobile = useIsMobile();

  const { pending, handleSubmit } = useHookForm(
    handler,
    updateSpeciality.bind(null, props.item.id) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: String() }
  });

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild onClick={e => e.currentTarget.blur()}>
        <Button variant="link" className="text-foreground px-0">
          {props.item.id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Speciality</DrawerTitle>
          <DrawerDescription>
            You can change the name for the selected speciality
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Form {...form}>
            <form
              id="speciality-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speciality</FormLabel>
                    <FormControl>
                      <Input {...field} type="name" placeholder="Physician" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            disabled={pending}
            form="speciality-form"
            className="cursor-pointer"
          >
            {pending ? 'Saving...' : 'Save'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function Component(props: Props) {
  const [query, setQuery] = useState(String());
  const [gender, setGender] = useState(String());

  const [debouncedQuery] = useDebounce(query, 300);
  const [speciality, setSpeciality] = useState(String());

  const [experience, setExperience] = useState(String());
  const [time, setTime] = useState<'morning' | 'evening' | string>(String());

  const doctors = useMemo(
    () =>
      props.doctors.filter(doctor => {
        const doctorGender = doctor.gender?.toLowerCase() || String();
        const doctorExperience = doctor.experience?.toString() || String();

        const doctorSpecialities = doctor.UserSpecialities?.map(us =>
          us.speciality.name.toLowerCase()
        );

        const doctorTimings = doctor.timings?.map(t => ({
          formatted: formatTime(t.time).toLowerCase(),
          hour: getHours(parse(t.time, 'HH:mm:ss', new Date()))
        }));

        if (
          debouncedQuery &&
          !(
            doctorGender == debouncedQuery ||
            doctorExperience.includes(debouncedQuery) ||
            doctor.name?.toLowerCase().includes(debouncedQuery) ||
            doctorTimings.some(t => t.formatted.includes(debouncedQuery)) ||
            doctorSpecialities.some(spec => spec.includes(debouncedQuery))
          )
        ) {
          return false;
        }

        if (gender && doctorGender != gender.toLowerCase()) return false;
        if (experience && !doctorExperience.includes(experience)) return false;

        if (
          speciality &&
          !doctorSpecialities.some(spec =>
            spec.includes(speciality.toLowerCase())
          )
        ) {
          return false;
        }

        if (
          time &&
          !doctorTimings.some(({ hour }) => {
            if (time === 'morning') return hour >= 6 && hour < 12;
            if (time === 'evening') return hour >= 12 && hour < 20;
            return false;
          })
        ) {
          return false;
        }

        return true;
      }),
    [debouncedQuery, experience, gender, props.doctors, speciality, time]
  );

  const resetFilters = useCallback(() => {
    setTime(String());
    setGender(String());
    setSpeciality(String());
    setExperience(String());
  }, []);

  const applyFilters = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);

      setTime(formData.get('time') as string);
      setGender(formData.get('gender') as string);
      setSpeciality(formData.get('speciality') as string);
      setExperience(formData.get('experience') as string);
    },
    []
  );

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      <form className="grid grid-cols-[1fr_auto_auto] gap-2">
        <Input
          type="text"
          name="name"
          id="doctor-name"
          className="w-full"
          placeholder="Search doctor..."
          onChange={e => setQuery(e.target.value.toLowerCase())}
        />
        <Dialog>
          <div>
            <DialogTrigger asChild>
              <Button className="block w-full">Filter</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Apply Filters</DialogTitle>
                <DialogDescription>
                  Find doctors based on your preferences.
                </DialogDescription>
              </DialogHeader>
              <form
                id="filter-form"
                className="space-y-4"
                onSubmit={applyFilters}
              >
                <div className="space-y-2">
                  <Label htmlFor="doctor-speciality">Speciality</Label>
                  <Select name="speciality">
                    <SelectTrigger
                      id="doctor-speciality"
                      className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                    >
                      <SelectValue placeholder="Select a speciality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physician">Physician</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-experience">Experience</Label>
                  <Select name="experience">
                    <SelectTrigger
                      id="doctor-experience"
                      className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                    >
                      <SelectValue placeholder="Select experience in years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="4">4 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                      <SelectItem value="Infinity">
                        More than 5 Years
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-gender">Gender</Label>
                  <Select name="gender">
                    <SelectTrigger
                      id="doctor-gender"
                      className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                    >
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-time">Time</Label>
                  <Select name="time">
                    <SelectTrigger
                      id="doctor-time"
                      className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate"
                    >
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </DialogClose>
                <Button type="submit" form="filter-form">
                  Filter
                </Button>
              </DialogFooter>
            </DialogContent>
          </div>
        </Dialog>
        <Button variant="secondary" onClick={resetFilters}>
          Reset
        </Button>
      </form>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(15em,1fr))] gap-4">
        {doctors.map(doctor => (
          <li key={doctor.id}>
            <Card className="rounded-md py-3">
              <CardContent className="space-y-3 px-3">
                <div className="relative min-h-40 overflow-hidden rounded-md">
                  <Image
                    fill
                    priority
                    unoptimized
                    alt={doctor.name as string}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={
                      `${!doctor.hasOAuth ? `${HOST}/api/upload/` : ''}${doctor.image}` ||
                      `${HOST}/api/upload/user.png`
                    }
                  />
                </div>
                <ul className="flex flex-wrap gap-2">
                  {doctor.timings.map(t => (
                    <li key={t.id}>
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold capitalize"
                      >
                        {formatTime(t.time)}
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
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  );
}
