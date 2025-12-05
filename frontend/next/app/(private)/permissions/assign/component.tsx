'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@prisma/client';
import { User } from 'next-auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
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
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';
import useHookForm from '@/hooks/use-hook-form';
import { assignPermissions } from '@/lib/actions';
import { rolePermissionsSchema } from '@/lib/schemas';
import { capitalize } from '@/lib/utils';

export default function Component(props: {
  user: User;
  roles: Role[];
  assigned: string[];
  role: string | undefined;
  permissions: { label: string; value: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const role = useMemo(() => props.role || String(), [props.role]);

  const { handleSubmit, pending } = useHookForm(
    handler,
    assignPermissions,
    true
  );

  const form = useForm({
    defaultValues: {
      name: props.roles.some(r => r.name === role) ? role : String(),
      permissions: props.assigned
    },
    resolver: zodResolver(rolePermissionsSchema)
  });

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);

      params.set(key, value);
      router.push(`${pathname}?${params}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className='flex h-full flex-col lg:mx-auto lg:w-10/12'>
      <Card>
        <CardHeader>
          <CardTitle>Add permissions for a given role</CardTitle>
          <CardDescription>
            Select a given role from the dropdown and choose the permissions to
            assign to that role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className='space-y-2'
              id='role-permissions-form'
              onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        name='role'
                        onValueChange={role => {
                          field.onChange(role);
                          updateParam('role', role);
                        }}
                        value={field.value}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a role' />
                        </SelectTrigger>
                        <SelectContent>
                          {props.roles.map(role => (
                            <SelectItem
                              className='capitalize'
                              key={role.id}
                              value={role.name}>
                              {capitalize(role.name)}
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
                name='permissions'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={props.permissions}
                        placeholder='Select permissions...'
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
            form='role-permissions-form'
            type='submit'>
            {pending ? 'Assigning permissions...' : 'Assign permissions'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
