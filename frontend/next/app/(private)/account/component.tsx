'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Gender, Prisma, Role } from '@prisma/client';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import z from 'zod';

import AvatarUpload from '@/components/avatar-upload';
import CoverUpload from '@/components/cover-upload';
import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardHeader,
  CardAction,
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
import MultiSelect from '@/components/ui/multi-select';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useHookForm from '@/hooks/use-hook-form';
import { updateDoctorProfile, updateUserProfile } from '@/lib/actions';
import { DATES } from '@/lib/constants';
import { doctorProfileSchema, userProfileSchema } from '@/lib/schemas';
import {
  hasRole,
  shortId,
  capitalize,
  hasFormChanged,
  getImageUrl
} from '@/lib/utils';

export default function Component({
  specialities,
  user
}: {
  specialities: { value: string; label: string }[];
  user: Prisma.UserGetPayload<{
    include: {
      timings: true;
      UserRoles: { include: { role: true } };
      UserSpecialities: { include: { speciality: true } };
    };
  }>;
}) {
  const [role, setRole] = useState(
    hasRole(
      user.UserRoles.map(ur => ur.role as Role),
      'doctor'
    )
      ? 'doctor'
      : 'user'
  );

  const defaultUserValues = useMemo<z.infer<typeof userProfileSchema>>(
    () => ({
      city: user.city ? capitalize(user.city) : String(),
      cover: user.cover || String(),
      email: user.email || String(),
      gender: (user.gender as Gender) || String(),
      image: user.image || String(),
      name: user.name || String(),
      password: String(),
      phone: user.phone || String()
    }),
    [
      user.city,
      user.name,
      user.cover,
      user.email,
      user.image,
      user.phone,
      user.gender
    ]
  );

  const defaultDoctorValues = useMemo<z.infer<typeof doctorProfileSchema>>(
    () => ({
      ...defaultUserValues,
      daysOfVisit: user.daysOfVisit || [],
      experience: user.experience || 0,
      gender: (user.gender as 'male' | 'female') || String(),
      specialities: user.UserSpecialities.map(us => us.speciality.id),
      timings: user.timings.length
        ? user.timings
        : [{ duration: 1, id: '1', time: '10:00:00' }]
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

  const userForm = useForm({
    defaultValues: defaultUserValues,
    resolver: zodResolver(userProfileSchema)
  });

  const doctorForm = useForm({
    defaultValues: defaultDoctorValues,
    resolver: zodResolver(doctorProfileSchema)
  });

  const watchedUserValues = {
    city: useWatch({ control: userForm.control, name: 'city' }),
    cover: useWatch({ control: userForm.control, name: 'cover' }),
    email: useWatch({ control: userForm.control, name: 'email' }),
    gender: useWatch({ control: userForm.control, name: 'gender' }),
    image: useWatch({ control: userForm.control, name: 'image' }),
    name: useWatch({ control: userForm.control, name: 'name' }),
    password: useWatch({ control: userForm.control, name: 'password' }),
    phone: useWatch({ control: userForm.control, name: 'phone' })
  };

  const watchedDoctorValues = {
    city: useWatch({ control: doctorForm.control, name: 'city' }),
    cover: useWatch({ control: doctorForm.control, name: 'cover' }),
    daysOfVisit: useWatch({ control: doctorForm.control, name: 'daysOfVisit' }),
    email: useWatch({ control: doctorForm.control, name: 'email' }),
    emailVerified: useWatch({
      control: doctorForm.control,
      name: 'emailVerified'
    }),
    experience: useWatch({
      control: doctorForm.control,
      name: 'experience'
    }) as number,
    gender: useWatch({ control: doctorForm.control, name: 'gender' }),
    image: useWatch({ control: doctorForm.control, name: 'image' }),
    name: useWatch({ control: doctorForm.control, name: 'name' }),
    password: useWatch({ control: doctorForm.control, name: 'password' }),
    phone: useWatch({ control: doctorForm.control, name: 'phone' }),
    specialities: useWatch({
      control: doctorForm.control,
      name: 'specialities'
    }),
    timings: useWatch({ control: doctorForm.control, name: 'timings' })
  };

  const { handleSubmit: submitUser } = useHookForm(
    handler,
    updateUserProfile.bind(null, user.id) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  const { handleSubmit: submitDoctor } = useHookForm(
    handler,
    updateDoctorProfile.bind(null, user.id) as (
      data: unknown
    ) => Promise<unknown>,
    true
  );

  return (
    <div className='h-full space-y-8 lg:mx-auto lg:w-10/12'>
      <Tabs defaultValue={role} onValueChange={setRole}>
        <Card>
          <CardHeader>
            <CardTitle className='capitalize'>{user.name}</CardTitle>
            <CardDescription>
              Add details for your profile here. Click save when you&apos;re
              done.
            </CardDescription>
            <CardAction>
              <TabsList>
                <TabsTrigger value='user'>User</TabsTrigger>
                <TabsTrigger value='doctor'>Doctor</TabsTrigger>
              </TabsList>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TabsContent value='user'>
              <Form {...userForm}>
                <form
                  className='relative space-y-2'
                  onSubmit={userForm.handleSubmit(submitUser)}
                >
                  <FormField
                    control={userForm.control}
                    name='cover'
                    render={({ field }) => (
                      <CoverUpload
                        className='h-80'
                        imageUrl={getImageUrl(user.hasOAuth, user.cover)}
                        onImageChange={field.onChange}
                      />
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name='image'
                    render={({ field }) => (
                      <AvatarUpload
                        className='absolute top-[calc(theme(spacing.80)-7rem)] left-4 size-24'
                        defaultAvatar={getImageUrl(user.hasOAuth, user.image)}
                        onFileChange={field.onChange}
                      />
                    )}
                  />
                  <FormField
                    control={userForm.control}
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
                    control={userForm.control}
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
                    control={userForm.control}
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
                    control={userForm.control}
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
                    control={userForm.control}
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
                    control={userForm.control}
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
                  <Button
                    disabled={
                      !hasFormChanged(defaultUserValues, watchedUserValues) ||
                      userForm.formState.isSubmitting
                    }
                    type='submit'
                  >
                    {userForm.formState.isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value='doctor'>
              <Form {...doctorForm}>
                <form
                  className='relative space-y-2'
                  onSubmit={doctorForm.handleSubmit(submitDoctor)}
                >
                  <FormField
                    control={doctorForm.control}
                    name='cover'
                    render={({ field }) => (
                      <CoverUpload
                        className='h-80'
                        imageUrl={getImageUrl(user.hasOAuth, user.cover)}
                        onImageChange={field.onChange}
                      />
                    )}
                  />
                  <FormField
                    control={doctorForm.control}
                    name='image'
                    render={({ field }) => (
                      <AvatarUpload
                        className='absolute top-[calc(theme(spacing.80)-7rem)] left-4 size-24'
                        defaultAvatar={getImageUrl(user.hasOAuth, user.image)}
                        onFileChange={field.onChange}
                      />
                    )}
                  />
                  <FormField
                    control={doctorForm.control}
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
                    control={doctorForm.control}
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
                    control={doctorForm.control}
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
                    control={doctorForm.control}
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
                    control={doctorForm.control}
                    name='experience'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Input
                            {...{ ...field, value: field.value as number }}
                            placeholder='1 Year'
                            type='number'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={doctorForm.control}
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
                    control={doctorForm.control}
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
                    control={doctorForm.control}
                    name='daysOfVisit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visiting Days</FormLabel>
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
                    control={doctorForm.control}
                    name='timings'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className='grid gap-0.5'>
                            <div className='flex items-center justify-between'>
                              <Label>Timings</Label>
                              <Button
                                onClick={() => {
                                  field.onChange([
                                    ...field.value,
                                    {
                                      duration: 1,
                                      id: shortId(5),
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
                                      value={time.duration}
                                    />
                                    <Button
                                      disabled={!index}
                                      onClick={() => {
                                        if (index) {
                                          const newTimings =
                                            field.value.slice();
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
                  <Button
                    disabled={
                      !hasFormChanged(
                        defaultDoctorValues,
                        watchedDoctorValues
                      ) || doctorForm.formState.isSubmitting
                    }
                    type='submit'
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
