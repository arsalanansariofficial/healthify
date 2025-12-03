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

type yesNo = 'yes' | 'no';

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
              className='space-y-2'
              id='membership-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Basic' type='text' />
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
                            type='button'
                            variant='ghost'
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
                                        className='cursor-pointer'
                                        onClick={() => {
                                          const newPerks = field.value.slice();
                                          newPerks.splice(index, 1);
                                          field.onChange(newPerks);
                                        }}
                                        type='button'
                                        variant='outline'
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
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].hospital.name =
                                              e.target.value;
                                            field.onChange(value);
                                          }}
                                          placeholder='Riverside Hospital'
                                          value={hm.hospital.name}
                                        />
                                        {error?.hospital?.name && (
                                          <span className='text-destructive text-sm'>
                                            {error.hospital.name.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Email</Label>
                                        <Input
                                          {...field}
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].hospital.email =
                                              e.target.value;
                                            field.onChange(value);
                                          }}
                                          placeholder='riverside@healthify.com'
                                          value={hm.hospital.email}
                                        />
                                        {error?.hospital?.email && (
                                          <span className='text-destructive text-sm'>
                                            {error.hospital.email.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>City</Label>
                                        <Input
                                          {...field}
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].hospital.city =
                                              e.target.value;
                                            field.onChange(value);
                                          }}
                                          placeholder='Moradabad'
                                          value={hm.hospital.city}
                                        />
                                        {error?.hospital?.city && (
                                          <span className='text-destructive text-sm'>
                                            {error.hospital.city.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Phone</Label>
                                        <Input
                                          {...field}
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].hospital.phone =
                                              e.target.value;
                                            field.onChange(value);
                                          }}
                                          placeholder='+919876543210'
                                          type='tel'
                                          value={hm.hospital.phone}
                                        />
                                        {error?.hospital?.phone && (
                                          <span className='text-destructive text-sm'>
                                            {error.hospital.phone.message}
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Affiliated</Label>
                                        <Select
                                          defaultValue={
                                            hm.hospital.isAffiliated as yesNo
                                          }
                                          onValueChange={(type: yesNo) => {
                                            const value = field.value.slice();
                                            value[index].hospital.isAffiliated =
                                              type;
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
                                        {error?.hospital?.isAffiliated && (
                                          <span className='text-destructive text-sm'>
                                            {
                                              error.hospital.isAffiliated
                                                .message
                                            }
                                          </span>
                                        )}
                                      </li>
                                      <li className='space-y-2'>
                                        <Label>Address</Label>
                                        <Textarea
                                          {...field}
                                          className={cn({
                                            'border-destructive focus-visible:ring-destructive':
                                              error
                                          })}
                                          onChange={e => {
                                            const value = field.value.slice();
                                            value[index].hospital.address =
                                              e.target.value;
                                            field.onChange(value);
                                          }}
                                          placeholder='123 Main Street, Springfield, IL 62704'
                                          value={hm.hospital.address}
                                        />
                                        {error?.hospital?.isAffiliated && (
                                          <span className='text-destructive text-sm'>
                                            {
                                              error.hospital.isAffiliated
                                                .message
                                            }
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
                control={form.control}
                name='perks'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='grid gap-0.5'>
                        <div className='flex items-center justify-between'>
                          <Label>Perks</Label>
                          <Button
                            onClick={() => {
                              field.onChange([...field.value, String()]);
                            }}
                            type='button'
                            variant='ghost'
                          >
                            <PlusIcon className='h-4 w-4' />
                          </Button>
                        </div>
                        <ul className='space-y-2'>
                          {field.value.map((perk, index) => {
                            const error = form.formState.errors.perks?.[index];

                            return (
                              <li
                                className='grid grid-cols-[1fr_auto] gap-2'
                                key={index}
                              >
                                <div className='space-y-2'>
                                  <Input
                                    {...field}
                                    className={cn({
                                      'border-destructive focus-visible:ring-destructive':
                                        error
                                    })}
                                    onChange={e => {
                                      const value = field.value.slice();
                                      value[index] = e.target.value;
                                      field.onChange(value);
                                    }}
                                    placeholder='Limited facilities with a basic plan.'
                                    value={perk}
                                  />
                                  {error && (
                                    <span className='text-destructive text-sm'>
                                      {error.message}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  onClick={() => {
                                    const newPerks = field.value.slice();
                                    newPerks.splice(index, 1);
                                    field.onChange(newPerks);
                                  }}
                                  type='button'
                                  variant='ghost'
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
                control={form.control}
                name='fees'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='grid gap-0.5'>
                        <div className='flex items-center justify-between'>
                          <Label>Fees</Label>
                          <Button
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
                                { amount: 100, renewalType: availableTypes[0] }
                              ]);
                            }}
                            type='button'
                            variant='ghost'
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
                                className='grid grid-cols-[1fr_1fr_auto] gap-2'
                                key={index}
                              >
                                <div className='space-y-2'>
                                  <Input
                                    className={cn({
                                      'border-destructive focus-visible:ring-destructive':
                                        error
                                    })}
                                    min={0}
                                    onChange={e => {
                                      const value = field.value.slice();
                                      value[index].amount = Number(
                                        e.target.value
                                      );
                                      field.onChange(value);
                                    }}
                                    placeholder='100 Rupees'
                                    value={fee.amount as number}
                                  />
                                  {error?.amount && (
                                    <span className='text-destructive text-sm'>
                                      {error.amount.message}
                                    </span>
                                  )}
                                </div>
                                <div className='space-y-2'>
                                  <Select
                                    onValueChange={(type: RenewalType) => {
                                      const value = field.value.slice();
                                      value[index].renewalType = type;
                                      field.onChange(value);
                                    }}
                                    value={fee.renewalType}
                                  >
                                    <SelectTrigger className='w-full [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                                      <SelectValue placeholder='Select a renewal type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableTypes.map(type => (
                                        <SelectItem
                                          className='capitalize'
                                          key={type}
                                          value={type}
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
                                  onClick={() => {
                                    const newFees = field.value.slice();
                                    newFees.splice(index, 1);
                                    field.onChange(newFees);
                                  }}
                                  type='button'
                                  variant='ghost'
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
