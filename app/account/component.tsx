'use client';

import Image from 'next/image';
import { useState } from 'react';
import { User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';

import * as utils from '@/lib/utils';
import { DAYS } from '@/lib/constants';
import { capitalize } from '@/lib/utils';
import Footer from '@/components/footer';
import { addDoctor } from '@/lib/actions';
import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { doctorSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import * as Select from '@/components/ui/select';
import handler from '@/components/display-toast';
import MultiSelect from '@/components/ui/multi-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  specialities: { value: string; label: string }[];
  user: Omit<User, 'token' | 'accounts' | 'hasOAuth' | 'password'> & {
    UserRoles: { role: { id: string; name: string } }[];
    timings: { id: string; time: string; duration: number }[];
    UserSpecialities: { speciality: { id: string; name: string } }[];
  };
};

export default function Component({ user, specialities }: Props) {
  const [image, setImage] = useState<File>();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const { pending, handleSubmit } = useHookForm(handler, addDoctor);

  const isUserDoctor = user.UserRoles.map(ur =>
    ur.role.name.toLowerCase()
  ).includes('doctor');

  const form = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      password: String(),
      timings: user.timings,
      name: user.name || String(),
      email: user.email || String(),
      phone: user.phone || String(),
      experience: user.experience || 0,
      city: user.city ? capitalize(user.city) : String(),
      daysOfVisit: user.daysOfVisit.map(d => capitalize(d)) || [],
      specialities: user.UserSpecialities.map(us => us.speciality.id)
    }
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];

    if (!file) return;
    setImage(file);

    const arrayBuffer = await file.arrayBuffer();
    const base64 = utils.arrayBufferToBase64(arrayBuffer);
    const dataUrl = `data:${file.type};base64,${base64}`;

    setImageSrc(dataUrl);
  }

  return (
    <div className="grid h-full xl:grid-cols-[1fr_auto] xl:gap-12">
      <section className="flex flex-col gap-8 lg:mx-auto lg:w-10/12">
        <Tabs
          defaultValue={isUserDoctor ? 'doctor' : 'user'}
          className="flex flex-col gap-8 lg:mx-auto lg:w-10/12"
        >
          <CN.Card>
            <CN.CardHeader>
              <CN.CardTitle>{user.name}</CN.CardTitle>
              <CN.CardDescription>
                Add details for your profile here. Click save when you&apos;re
                done.
              </CN.CardDescription>
              <CN.CardAction>
                <TabsList>
                  <TabsTrigger value="user">User</TabsTrigger>
                  <TabsTrigger value="doctor">Doctor</TabsTrigger>
                </TabsList>
              </CN.CardAction>
            </CN.CardHeader>
            <CN.CardContent>
              <TabsContent value="user">
                <RHF.Form {...form}>
                  <form
                    className="space-y-2"
                    onSubmit={form.handleSubmit(handleSubmit)}
                  >
                    <RHF.FormField
                      name="image"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormControl>
                            <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
                              <Label
                                htmlFor="image"
                                className={utils.cn(
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
                          </RHF.FormControl>
                          <RHF.FormMessage />
                        </RHF.FormItem>
                      )}
                    />
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
                      name="password"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Password</RHF.FormLabel>
                          <RHF.FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Secret@123"
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
                      name="gender"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Gender</RHF.FormLabel>
                          <RHF.FormControl>
                            <Select.Select
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                            >
                              <Select.SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                                <Select.SelectValue placeholder="Select a gender" />
                              </Select.SelectTrigger>
                              <Select.SelectContent>
                                <Select.SelectItem value="male">
                                  Male
                                </Select.SelectItem>
                                <Select.SelectItem value="female">
                                  Female
                                </Select.SelectItem>
                              </Select.SelectContent>
                            </Select.Select>
                          </RHF.FormControl>
                          <RHF.FormMessage />
                        </RHF.FormItem>
                      )}
                    />
                    <RHF.FormField
                      name="experience"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Experience</RHF.FormLabel>
                          <RHF.FormControl>
                            <Input
                              min={1}
                              max={100}
                              {...field}
                              type="number"
                              placeholder="Moradabad"
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
                    <Button type="submit" disabled={pending}>
                      {pending ? 'Saving...' : 'Save'}
                    </Button>
                  </form>
                </RHF.Form>
              </TabsContent>
              <TabsContent value="doctor">
                <RHF.Form {...form}>
                  <form
                    className="space-y-2"
                    onSubmit={form.handleSubmit(handleSubmit)}
                  >
                    <RHF.FormField
                      name="image"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormControl>
                            <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
                              <Label
                                htmlFor="image"
                                className={utils.cn(
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
                          </RHF.FormControl>
                          <RHF.FormMessage />
                        </RHF.FormItem>
                      )}
                    />
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
                      name="password"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Password</RHF.FormLabel>
                          <RHF.FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Secret@123"
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
                      name="gender"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Gender</RHF.FormLabel>
                          <RHF.FormControl>
                            <Select.Select
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                            >
                              <Select.SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                                <Select.SelectValue placeholder="Select a gender" />
                              </Select.SelectTrigger>
                              <Select.SelectContent>
                                <Select.SelectItem value="male">
                                  Male
                                </Select.SelectItem>
                                <Select.SelectItem value="female">
                                  Female
                                </Select.SelectItem>
                              </Select.SelectContent>
                            </Select.Select>
                          </RHF.FormControl>
                          <RHF.FormMessage />
                        </RHF.FormItem>
                      )}
                    />
                    <RHF.FormField
                      name="experience"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Experience</RHF.FormLabel>
                          <RHF.FormControl>
                            <Input
                              min={1}
                              max={100}
                              {...field}
                              type="number"
                              placeholder="Moradabad"
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
                      name="specialities"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Specialities</RHF.FormLabel>
                          <RHF.FormControl>
                            <MultiSelect
                              setSelectedValues={field.onChange}
                              placeholder="Select specialities ..."
                              selectedValues={field.value.map(s =>
                                capitalize(s)
                              )}
                              options={specialities.map(s => ({
                                label: capitalize(s.label),
                                value: capitalize(s.value)
                              }))}
                            />
                          </RHF.FormControl>
                          <RHF.FormMessage />
                        </RHF.FormItem>
                      )}
                    />
                    <RHF.FormField
                      name="daysOfVisit"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormLabel>Visiting Days</RHF.FormLabel>
                          <RHF.FormControl>
                            <MultiSelect
                              selectedValues={field.value}
                              setSelectedValues={field.onChange}
                              placeholder="Select specialities ..."
                              options={DAYS.map(d => ({
                                label: capitalize(d.label),
                                value: capitalize(d.value)
                              }))}
                            />
                          </RHF.FormControl>
                          <RHF.FormMessage />
                        </RHF.FormItem>
                      )}
                    />
                    <RHF.FormField
                      name="timings"
                      control={form.control}
                      render={({ field }) => (
                        <RHF.FormItem>
                          <RHF.FormControl>
                            <div className="grid gap-0.5">
                              <div className="flex items-center justify-between">
                                <Label>Timings</Label>
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
                                        )
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
                                          time[index].duration =
                                            +e.target.value;
                                          field.onChange(time);
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        disabled={!index}
                                        onClick={() => {
                                          if (index) {
                                            const newTimings =
                                              field.value.slice();
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
                                <RHF.FormMessage />
                              </div>
                            </div>
                          </RHF.FormControl>
                          <RHF.FormMessage />
                        </RHF.FormItem>
                      )}
                    />
                    <Button type="submit" disabled={pending}>
                      {pending ? 'Saving...' : 'Save'}
                    </Button>
                  </form>
                </RHF.Form>
              </TabsContent>
            </CN.CardContent>
          </CN.Card>
        </Tabs>
        <Footer />
      </section>
      <aside className="sticky top-[5.25em] hidden h-[calc(100vh-10em)] xl:block">
        <div>
          {user.image && (
            <div className="relative grid min-h-50 gap-3 overflow-clip rounded-md border-2 border-dashed">
              <Image
                fill
                alt="Profile Picture"
                className="aspect-sqaure object-cover"
                src={user.image ? `/users/${user.image}` : '/users/user.png'}
              />
            </div>
          )}
          {user.name && (
            <div className="grid gap-1">
              <h2 className="font-serif">Name</h2>
              <span className="font-semibold capitalize">{user.name}</span>
            </div>
          )}
          {user.email && (
            <div className="grid gap-1">
              <h2 className="font-serif">Email</h2>
              <span className="font-semibold">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="grid gap-1">
              <h2 className="font-serif">Phone</h2>
              <span className="font-semibold capitalize">{user.phone}</span>
            </div>
          )}
          {user.gender && (
            <div className="grid gap-1">
              <h2 className="font-serif">Gender</h2>
              <span className="font-semibold capitalize">{user.gender}</span>
            </div>
          )}
          {user.experience && (
            <div className="grid gap-1">
              <h2 className="font-serif">Experience</h2>
              <span className="font-semibold capitalize">
                {user.experience} years
              </span>
            </div>
          )}
          {user.city && (
            <div className="grid gap-1">
              <h2 className="font-serif">City</h2>
              <span className="font-semibold">{capitalize(user.city)}</span>
            </div>
          )}
          {user.UserRoles.length > 0 && (
            <div className="grid gap-1">
              <h2 className="font-serif">Roles</h2>
              <ul className="flex flex-wrap gap-2">
                {user.UserRoles.map(ur => (
                  <li key={ur.role.id} className="font-semibold">
                    <Badge>{capitalize(ur.role.name)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {user.UserSpecialities.length > 0 && (
            <div className="grid gap-1">
              <h2 className="font-serif">Specialities</h2>
              <ul className="flex flex-wrap gap-2">
                {user.UserSpecialities.map(us => (
                  <li key={us.speciality.id} className="font-semibold">
                    <Badge>{capitalize(us.speciality.name)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {user.daysOfVisit.length > 0 && (
            <div className="grid gap-1">
              <h2 className="font-serif">Visiting Days</h2>
              <ul className="flex flex-wrap gap-2">
                {user.daysOfVisit.map(vd => (
                  <li key={vd} className="font-semibold">
                    <Badge>{capitalize(vd)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {user.timings.length > 0 && (
            <div className="grid gap-1">
              <h2 className="font-serif">Timings</h2>
              <ul className="flex flex-wrap gap-2">
                {user.timings.map(t => (
                  <li key={t.id} className="font-semibold">
                    <Badge>{utils.formatTime(t.time)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
