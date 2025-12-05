'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Department, Membership, User } from '@prisma/client';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
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
  FormMessage,
  FormControl
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import MultiSelect from '@/components/ui/multi-select';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { addHospital } from '@/lib/actions';
import { hospitalSchema } from '@/lib/schemas';

export default function Component({
  departments,
  memberships,
  users
}: {
  departments: Department[];
  memberships: Membership[];
  users: Pick<User, 'id' | 'name'>[];
}) {
  const { handleSubmit } = useHookForm(handler, addHospital);
  const form = useForm({
    defaultValues: {
      address: String(),
      city: String(),
      doctors: [],
      email: String(),
      hospitalDepartments: [],
      hospitalMemberships: [],
      isAffiliated: 'no',
      name: String(),
      phone: String()
    },
    resolver: zodResolver(hospitalSchema)
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Add Hospital</CardTitle>
          <CardDescription>
            Add details for the hospital here. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='hospital-form'
              onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Riverdale General Hospital'
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
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Moradabad' type='text' />
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
                name='isAffiliated'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affliated</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                          <SelectValue placeholder='Select a status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='yes'>Yes</SelectItem>
                          <SelectItem value='no'>No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='123 Main Street, Springfield, IL 62704'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='hospitalDepartments'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departments</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={departments.map(d => ({
                          label: d.name || String(),
                          value: d.id
                        }))}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='hospitalMemberships'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memberships</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={memberships.map(m => ({
                          label: m.name || String(),
                          value: m.id
                        }))}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='doctors'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Users</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={users.map(u => ({
                          label: u.name || String(),
                          value: u.id
                        }))}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
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
          <Button
            className='cursor-pointer'
            disabled={form.formState.isLoading}
            form='hospital-form'
            type='submit'>
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
