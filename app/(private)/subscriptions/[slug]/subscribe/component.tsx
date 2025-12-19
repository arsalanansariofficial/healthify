'use client';

import { User } from 'next-auth';
import { Prisma } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
import { capitalize } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { subscribeMembership } from '@/lib/actions';
import MultiSelect from '@/components/ui/multi-select';
import { membershipSubscriptionSchema } from '@/lib/schemas';

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

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';

export default function Component({
  users,
  membership
}: {
  user: User;
  membership: Prisma.MembershipGetPayload<{ include: { fees: true } }>;
  users: Prisma.UserGetPayload<{ select: { id: true; name: true } }>[];
}) {
  const { handleSubmit } = useHookForm(handler, subscribeMembership);
  const form = useForm({
    resolver: zodResolver(membershipSubscriptionSchema),
    defaultValues: {
      users: [],
      feeId: String(),
      membershipId: membership.id
    }
  });

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Add Membership</CardTitle>
          <CardDescription>
            Add details for the membership here. Click save when you&apos;re
            done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id='membership-form'
              className='space-y-2'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className='space-y-2'>
                <Label>Membership</Label>
                <Input
                  disabled
                  type='text'
                  placeholder='Basic'
                  value={membership.name}
                />
              </div>
              <FormField
                name='feeId'
                control={form.control}
                render={({ field }) => {
                  const fee = membership.fees.find(f => f.id === field.value);
                  const amount = fee ? `Rs. ${fee.amount}` : String();

                  return (
                    <FormItem>
                      <FormLabel>Payment Mode</FormLabel>
                      <FormControl>
                        <div className='grid grid-cols-[1fr_auto] gap-2'>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                              <SelectValue placeholder='Select a payment mode' />
                            </SelectTrigger>
                            <SelectContent>
                              {membership.fees.map(f => (
                                <SelectItem
                                  key={f.id}
                                  value={f.id}
                                  className='capitalize'
                                >
                                  {capitalize(f.renewalType)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            disabled
                            type='text'
                            value={amount}
                            placeholder='Rs. 100'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                name='users'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Users</FormLabel>
                    <FormControl>
                      <MultiSelect
                        selectedValues={field.value}
                        placeholder='Select users...'
                        setSelectedValues={field.onChange}
                        options={users.map(u => ({
                          value: u.id,
                          label: u.name || String()
                        }))}
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
            type='submit'
            form='membership-form'
            className='cursor-pointer'
            disabled={form.formState.isLoading}
          >
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
