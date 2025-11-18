'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma, Role } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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
  FormControl,
  FormMessage
} from '@/components/ui/form';
import MultiSelect from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import useHookForm from '@/hooks/use-hook-form';
import { assignRoles } from '@/lib/actions';
import { userRolesSchema } from '@/lib/schemas';

export default function Component({
  roles,
  userId,
  users
}: {
  userId?: string;
  users: Prisma.UserGetPayload<{
    select: {
      email: true;
      id: true;
      name: true;
      UserRoles: {
        select: { id: true; role: { select: { name: true; id: true } } };
      };
    };
  }>[];
  roles: Role[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const userRoles =
    users.find(v => v.id === userId)?.UserRoles.map(v => v.role.id) || [];

  const form = useForm({
    defaultValues: {
      id: userId || String(),
      roles: roles.filter(v => userRoles.includes(v.id)).map(v => v.id)
    },
    resolver: zodResolver(userRolesSchema)
  });

  const { handleSubmit, pending } = useHookForm(handler, assignRoles);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);

      params.set(key, value);
      router.push(`${pathname}?${params}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className='flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Assign roles</CardTitle>
          <CardDescription>
            Select the roles from the list that you want to assign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='roles-form'
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name='id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={v => {
                          updateParam('userId', v);
                          field.onChange(v);
                        }}
                      >
                        <SelectTrigger className='w-full [&_i]:px-2 [&_span[data-slot]]:block [&_span[data-slot]]:truncate'>
                          <SelectValue placeholder='Select a user' />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(v => (
                            <SelectItem
                              className='flex items-center gap-2'
                              key={v.id}
                              value={v.id}
                            >
                              <strong className='font-semibold capitalize'>
                                {v.name}
                              </strong>
                              <i>{v.email}</i>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roles'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={roles.map(v => ({
                          label: v.name,
                          value: v.id
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
            disabled={pending}
            form='roles-form'
            type='submit'
          >
            {pending ? 'Adding roles...' : 'Add roles'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
