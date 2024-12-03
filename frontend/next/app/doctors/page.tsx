'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { PlusIcon } from 'lucide-react';

import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as Select from '@/components/ui/select';

export default function Page() {
  const [time, setTime] = useState<string>();
  const [gender, setGender] = useState<string>();
  const [speciality, setSpeciality] = useState<string>();
  const [experience, setExperience] = useState<string>();
  const [selectedTimeslots, setSelectedTimeslots] = useState<string[]>([]);

  return (
    <div className="col-span-2 space-y-4 lg:col-start-2">
      <section className="space-y-4">
        <header>
          <CN.Card>
            <CN.CardContent>
              <h1 className="font-semibold">Doctors</h1>
            </CN.CardContent>
          </CN.Card>
        </header>
        <main>
          <CN.Card>
            <CN.CardHeader>
              <form action="" className="grid grid-cols-8 gap-2">
                <div>
                  <Label htmlFor="doctor-name" className="sr-only">
                    Name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    id="doctor-name"
                    className="w-full"
                    placeholder="Search doctor..."
                  />
                </div>
                <div>
                  <Label htmlFor="doctor-speciality" className="sr-only">
                    Speciality
                  </Label>
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
                <div>
                  <Label htmlFor="doctor-experience" className="sr-only">
                    Experience
                  </Label>
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
                <div>
                  <Label htmlFor="doctor-gender" className="sr-only">
                    Gender
                  </Label>
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
                <div>
                  <Label htmlFor="doctor-time" className="sr-only">
                    Time
                  </Label>
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
                <div className="col-span-3 grid min-w-fit auto-cols-auto grid-flow-col gap-2">
                  <Button type="submit">Search</Button>
                  <Button type="button" variant="secondary">
                    Reset
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link
                      title="Add Doctor"
                      href="/doctors/add"
                      className="flex items-center gap-1 truncate p-2"
                    >
                      <PlusIcon /> Add
                    </Link>
                  </Button>
                </div>
              </form>
            </CN.CardHeader>
            <CN.CardContent className="grid grid-cols-[repeat(auto-fill,minmax(15em,1fr))] gap-4">
              <CN.Card className="rounded-md py-3">
                <CN.CardContent className="space-y-3 px-3">
                  <div className="relative min-h-40 overflow-hidden rounded-md">
                    <Image
                      fill
                      priority
                      alt="Doctor Name"
                      src="/users/user.png"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(2em,1fr))] gap-2">
                    <Badge variant="outline" className="w-full font-serif">
                      Time
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h2 className="font-serif leading-none">Doctor Name</h2>
                      <span className="block font-serif text-sm leading-none">
                        Speciality
                      </span>
                      <span className="block font-serif text-sm leading-none">
                        Gender
                      </span>
                    </div>
                    <Badge className="font-serif" variant="secondary">
                      Experience
                    </Badge>
                  </div>
                  <Button variant="outline" className="mt-4 block w-full">
                    Get Appointment
                  </Button>
                </CN.CardContent>
              </CN.Card>
            </CN.CardContent>
          </CN.Card>
        </main>
      </section>
    </div>
  );
}
