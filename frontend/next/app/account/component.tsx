'use client';

import z from 'zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { FileIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Role, Speciality, TimeSlot, User } from '@prisma/client';

import Footer from '@/components/footer';
import { DAYS, HOST } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import MultiSelect from '@/components/ui/multi-select';
import { doctorProfileSchema, userProfileSchema } from '@/lib/schemas';
import { updateDoctorProfile, updateUserProfile } from '@/lib/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  hasRole,
  shortId,
  capitalize,
  hasFormChanged,
  arrayBufferToBase64
} from '@/lib/utils';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';

import {
  Card,
  CardTitle,
  CardHeader,
  CardAction,
  CardContent,
  CardDescription
} from '@/components/ui/card';

type Props = {
  specialities: { value: string; label: string }[];
  user: Omit<User, 'token' | 'accounts' | 'password'> & {
    UserRoles: { role: Pick<Role, 'id' | 'name'> }[];
    timings: Pick<TimeSlot, 'id' | 'time' | 'duration'>[];
    UserSpecialities: { speciality: Pick<Speciality, 'id' | 'name'> }[];
  };
};

export default function Component({ user, specialities }: Props) {
  const isDoctor = useMemo(
    () =>
      hasRole(
        user.UserRoles.map(ur => ur.role as Role),
        'doctor'
      ),
    [user.UserRoles]
  );

  const defaultUserValues = useMemo<z.infer<typeof userProfileSchema>>(
    () => ({
      password: String(),
      name: user.name || String(),
      email: user.email || String(),
      phone: user.phone || String(),
      city: user.city ? capitalize(user.city) : String(),
      gender: (user.gender as 'male' | 'female') || String()
    }),
    [user.city, user.email, user.gender, user.name, user.phone]
  );

  const defaultDoctorValues = useMemo<z.infer<typeof doctorProfileSchema>>(
    () => ({
      ...defaultUserValues,
      experience: user.experience || 0,
      gender: (user.gender as 'male' | 'female') || String(),
      daysOfVisit: user.daysOfVisit.map(d => capitalize(d)) || [],
      specialities: user.UserSpecialities.map(us => us.speciality.id),
      timings: user.timings.length
        ? user.timings
        : [{ id: '1', time: '10:00:00', duration: 1 }]
    }),
    [
      user.gender,
      user.timings,
      user.experience,
      user.daysOfVisit,
      defaultUserValues,
      user.UserSpecialities
    ]
  );

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [role, setRole] = useState(isDoctor ? 'doctor' : 'user');

  const { handleSubmit: submitUser } = useHookForm(
    handler,
    updateUserProfile.bind(null, user.id) as (data: unknown) => Promise<unknown>
  );

  const { handleSubmit: submitDoctor } = useHookForm(
    handler,
    updateDoctorProfile.bind(null, user.id) as (
      data: unknown
    ) => Promise<unknown>
  );

  const userForm = useForm({
    defaultValues: defaultUserValues,
    resolver: zodResolver(userProfileSchema)
  });

  const doctorForm = useForm({
    defaultValues: defaultDoctorValues,
    resolver: zodResolver(doctorProfileSchema)
  });

  const handleFileChange = useCallback(async function (
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const dataUrl = `data:${file.type};base64,${base64}`;

    setImageSrc(dataUrl);
  }, []);

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
      <Tabs defaultValue={role} onValueChange={setRole}>
        <Card>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>
              Add details for your profile here. Click save when you&apos;re
              done.
            </CardDescription>
            <CardAction>
              <TabsList>
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
              </TabsList>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TabsContent value="user">
              <Form {...userForm}>
                <form
                  className="space-y-2"
                  onSubmit={userForm.handleSubmit(submitUser)}
                >
                  <FormField
                    name="image"
                    control={userForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
                            <Label
                              htmlFor="image"
                              className="absolute inset-0 z-10 grid place-items-center"
                            >
                              <FileIcon />
                            </Label>
                            {(imageSrc || user.image) && (
                              <Image
                                fill
                                unoptimized
                                alt="Profile Picture"
                                className="aspect-video object-cover"
                                src={
                                  imageSrc || `${!user.hasOAuth ? `${HOST}/api/upload/` : ''}${user.image}`
                                }
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="name"
                    control={userForm.control}
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
                    control={userForm.control}
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
                    name="password"
                    control={userForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Secret@123"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="phone"
                    control={userForm.control}
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
                    name="gender"
                    control={userForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                              <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="city"
                    control={userForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Moradabad"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={
                      !hasFormChanged(defaultUserValues, userForm.watch()) ||
                      userForm.formState.isSubmitting
                    }
                  >
                    {userForm.formState.isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="doctor">
              <Form {...doctorForm}>
                <form
                  className="space-y-2"
                  onSubmit={doctorForm.handleSubmit(submitDoctor)}
                >
                  <FormField
                    name="image"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative grid min-h-80 gap-3 overflow-clip rounded-md border-2 border-dashed">
                            <Label
                              htmlFor="image"
                              className="absolute inset-0 z-10 grid place-items-center"
                            >
                              <FileIcon />
                            </Label>
                            {(imageSrc || user.image) && (
                              <Image
                                fill
                                unoptimized
                                alt="Profile Picture"
                                className="aspect-video object-cover"
                                src={
                                  imageSrc ||
                                  `${!user.hasOAuth ? `${HOST}/api/upload/` : ''}${user.image}`
                                }
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="name"
                    control={doctorForm.control}
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
                    control={doctorForm.control}
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
                    name="password"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Secret@123"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="phone"
                    control={doctorForm.control}
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
                    name="gender"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate">
                              <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="experience"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="1 Year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="city"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Moradabad"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="specialities"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialities</FormLabel>
                        <FormControl>
                          <MultiSelect
                            setSelectedValues={field.onChange}
                            placeholder="Select specialities ..."
                            selectedValues={field.value}
                            options={specialities.map(s => ({
                              ...s,
                              label: capitalize(s.label)
                            }))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="daysOfVisit"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visiting Days</FormLabel>
                        <FormControl>
                          <MultiSelect
                            selectedValues={field.value}
                            setSelectedValues={field.onChange}
                            placeholder="Select specialities ..."
                            options={DAYS.map(d => ({
                              label: capitalize(d.label),
                              value: capitalize(d.value)
                            }))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="timings"
                    control={doctorForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-0.5">
                            <div className="flex items-center justify-between">
                              <Label>Timings</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  field.onChange([
                                    ...field.value,
                                    {
                                      duration: 1,
                                      time: '10:00:00',
                                      id: shortId(5)
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
                                        time[index].duration = +e.target.value;
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
                              <FormMessage />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={
                      !hasFormChanged(
                        defaultDoctorValues,
                        doctorForm.watch()
                      ) || doctorForm.formState.isSubmitting
                    }
                  >
                    {doctorForm.formState.isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
      <Footer />
    </div>
  );
}
