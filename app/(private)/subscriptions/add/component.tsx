'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RenewalType } from '@prisma/client';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import handler from '@/components/display-toast';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardAction,
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
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useHookForm from '@/hooks/use-hook-form';
import { addMembership } from '@/lib/actions';
import { membershipSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

export default function Component() {
  const { handleSubmit } = useHookForm(handler, addMembership);
  const form = useForm({
    defaultValues: {
      fees: [],
      hospitalMemberships: [],
      name: String(),
      perks: []
    },
    resolver: zodResolver(membershipSchema)
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
              <FormField
                name='name'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} type='text' placeholder='Basic' />
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
                    <FormControl>
                      <div className='grid gap-0.5'>
                        <div className='flex items-center justify-between'>
                          <Label>Hospitals</Label>
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() => {
                              field.onChange([
                                ...field.value,
                                {
                                  address: String(),
                                  city: String(),
                                  email: String(),
                                  isAffiliated: 'no',
                                  name: String(),
                                  phone: String()
                                }
                              ]);
                            }}
                          >
                            <PlusIcon className='h-4 w-4' />
                          </Button>
                        </div>
                        <ul className='space-y-2'>
                          {field.value.map((hm, index) => {
                            const error =
                              form.formState.errors.hospitalMemberships?.[
                                index
                              ];

                            return (
                              <li key={index}>
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Add Hospital</CardTitle>
                                    <CardDescription>
                                      Provide the details for the hospital
                                      required to be added.
                                    </CardDescription>
                                    <CardAction>
                                      <Button
                                        type='button'
                                        variant='outline'
                                        className='cursor-pointer'
                                        onClick={() => {
                                          const newPerks = field.value.slice();
                                          newPerks.splice(index, 1);
                                          field.onChange(newPerks);
                                        }}
                                      >
                                        <TrashIcon className='h-4 w-4' />
                                      </Button>
                                    </CardAction>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className='space-y-2'>
                                      <li className='space-y-2'>
                                        <Label>Name</Label>
                                        <Input
                                          {...field}
                                          value={hm.name}
                                          placeholder='Riverside Hospital'
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].name = e.target.value;
                                            field.onChange(value);
                                          }}
                                        />
                                        {error?.name && (
                                          <span className='text-destructive text-sm'>
                                            {error.name.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Email</Label>
                                        <Input
                                          {...field}
                                          value={hm.email}
                                          placeholder='riverside@healthify.com'
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].email = e.target.value;
                                            field.onChange(value);
                                          }}
                                        />
                                        {error?.email && (
                                          <span className='text-destructive text-sm'>
                                            {error.email.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>City</Label>
                                        <Input
                                          {...field}
                                          value={hm.city}
                                          placeholder='Moradabad'
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].city = e.target.value;
                                            field.onChange(value);
                                          }}
                                        />
                                        {error?.city && (
                                          <span className='text-destructive text-sm'>
                                            {error.city.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Phone</Label>
                                        <Input
                                          {...field}
                                          type='tel'
                                          value={hm.phone}
                                          placeholder='+919876543210'
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].phone = e.target.value;
                                            field.onChange(value);
                                          }}
                                        />
                                        {error?.phone && (
                                          <span className='text-destructive text-sm'>
                                            {error.phone.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Affiliated</Label>
                                        <Select
                                          defaultValue={hm.isAffiliated}
                                          onValueChange={(
                                            type: 'yes' | 'no'
                                          ) => {
                                            const value = field.value.slice();
                                            value[index].isAffiliated = type;
                                            field.onChange(value);
                                          }}
                                        >
                                          <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                                            <SelectValue placeholder='Select a value' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value='no'>
                                              No
                                            </SelectItem>
                                            <SelectItem value='yes'>
                                              Yes
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        {error?.isAffiliated && (
                                          <span className='text-destructive text-sm'>
                                            {error.isAffiliated.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Address</Label>
                                        <Textarea
                                          {...field}
                                          value={hm.address}
                                          placeholder='123 Main Street, Springfield, IL 62704'
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].address =
                                              e.target.value;
                                            field.onChange(value);
                                          }}
                                        />
                                        {error?.isAffiliated && (
                                          <span className='text-destructive text-sm'>
                                            {error.isAffiliated.message}
                                          </span>
                                        )}
                                      </li>
                                    </ul>
                                  </CardContent>
                                </Card>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='perks'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='grid gap-0.5'>
                        <div className='flex items-center justify-between'>
                          <Label>Perks</Label>
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() => {
                              field.onChange([...field.value, String()]);
                            }}
                          >
                            <PlusIcon className='h-4 w-4' />
                          </Button>
                        </div>
                        <ul className='space-y-2'>
                          {field.value.map((perk, index) => {
                            const error = form.formState.errors.perks?.[index];

                            return (
                              <li
                                key={index}
                                className='grid grid-cols-[1fr_auto] gap-2'
                              >
                                <div className='space-y-2'>
                                  <Input
                                    {...field}
                                    value={perk}
                                    placeholder='Limited facilities with a basic plan.'
                                    className={cn({
                                      'border-destructive focus-visible:ring-destructive':
                                        error
                                    })}
                                    onChange={e => {
                                      const value = field.value.slice();
                                      value[index] = e.target.value;
                                      field.onChange(value);
                                    }}
                                  />
                                  {error && (
                                    <span className='text-destructive text-sm'>
                                      {error.message}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  onClick={() => {
                                    const newPerks = field.value.slice();
                                    newPerks.splice(index, 1);
                                    field.onChange(newPerks);
                                  }}
                                >
                                  <TrashIcon className='h-4 w-4' />
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='fees'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='grid gap-0.5'>
                        <div className='flex items-center justify-between'>
                          <Label>Fees</Label>
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() => {
                              const usedTypes = field.value.map(
                                f => f.renewalType
                              );

                              const availableTypes = Object.values(
                                RenewalType
                              ).filter(type => !usedTypes.includes(type));

                              if (!availableTypes.length) return;

                              field.onChange([
                                ...field.value,
                                {
                                  amount: 100,
                                  renewalType: availableTypes[0]
                                }
                              ]);
                            }}
                          >
                            <PlusIcon className='h-4 w-4' />
                          </Button>
                        </div>
                        <ul className='space-y-2'>
                          {field.value.map((fee, index) => {
                            const error = form.formState.errors.fees?.[index];

                            const usedTypes = field.value
                              .filter((_, i) => i !== index)
                              .map(f => f.renewalType);

                            const availableTypes = Object.values(
                              RenewalType
                            ).filter(type => !usedTypes.includes(type));

                            return (
                              <li
                                key={index}
                                className='grid grid-cols-[1fr_1fr_auto] gap-2'
                              >
                                <div className='space-y-2'>
                                  <Input
                                    min={0}
                                    value={fee.amount}
                                    placeholder='100 Rupees'
                                    className={cn({
                                      'border-destructive focus-visible:ring-destructive':
                                        error
                                    })}
                                    onChange={e => {
                                      const value = field.value.slice();
                                      value[index].amount = +e.target.value;
                                      field.onChange(value);
                                    }}
                                  />
                                  {error?.amount && (
                                    <span className='text-destructive text-sm'>
                                      {error.amount.message}
                                    </span>
                                  )}
                                </div>
                                <div className='space-y-2'>
                                  <Select
                                    value={fee.renewalType}
                                    onValueChange={(type: RenewalType) => {
                                      const value = field.value.slice();
                                      value[index].renewalType = type;
                                      field.onChange(value);
                                    }}
                                  >
                                    <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                                      <SelectValue placeholder='Select a renewal type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableTypes.map(type => (
                                        <SelectItem
                                          key={type}
                                          value={type}
                                          className='capitalize'
                                        >
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {error?.renewalType && (
                                    <span className='text-destructive text-sm'>
                                      {error.renewalType.message}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  onClick={() => {
                                    const newFees = field.value.slice();
                                    newFees.splice(index, 1);
                                    field.onChange(newFees);
                                  }}
                                >
                                  <TrashIcon className='h-4 w-4' />
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                        <FormMessage />
                      </div>
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
