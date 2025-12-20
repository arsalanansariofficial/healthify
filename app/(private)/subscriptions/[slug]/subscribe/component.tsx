'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma } from '@prisma/client';
import { User } from 'next-auth';
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
import { Label } from '@/components/ui/label';
import MultiSelect from '@/components/ui/multi-select';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import useHookForm from '@/hooks/use-hook-form';
import { subscribeMembership } from '@/lib/actions';
import { membershipSubscriptionSchema } from '@/lib/schemas';
import { capitalize } from '@/lib/utils';

export default function Component({
  membership,
  users
}: {
  user: User;
  membership: Prisma.MembershipGetPayload<{ include: { fees: true } }>;
  users: Prisma.UserGetPayload<{ select: { id: true; name: true } }>[];
}) {
  const { handleSubmit } = useHookForm(handler, subscribeMembership);
  const form = useForm({
    defaultValues: {
      feeId: String(),
      membershipId: membership.id,
      users: []
    },
    resolver: zodResolver(membershipSubscriptionSchema)
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
              className='space-y-2'
              id='membership-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className='space-y-2'>
                <Label>Membership</Label>
                <Input
                  disabled
                  placeholder='Basic'
                  type='text'
                  value={membership.name}
                />
              </div>
              <FormField
                control={form.control}
                name='feeId'
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
                                  className='capitalize'
                                  key={f.id}
                                  value={f.id}
                                >
                                  {capitalize(f.renewalType)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            disabled
                            placeholder='Rs. 100'
                            type='text'
                            value={amount}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name='users'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Users</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={users.map(u => ({
                          label: u.name || String(),
                          value: u.id
                        }))}
                        placeholder='Select users...'
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
            form='membership-form'
            type='submit'
          >
            {form.formState.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
