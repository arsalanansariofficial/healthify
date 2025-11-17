'use client';

import { User } from 'next-auth';
import { Role } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { assignPermissions } from '@/lib/actions';
import { rolePermissionsSchema } from '@/lib/schemas';
import MultiSelect from '@/components/ui/multi-select';

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
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

type Props = {
  user: User;
  roles: Role[];
  assigned: string[];
  role: string | undefined;
  permissions: { label: string; value: string }[];
};

export default function Component(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const role = useMemo(
    () => props.role ?? props.roles[0].name,
    [props.role, props.roles]
  );

  const { pending, handleSubmit } = useHookForm(
    handler,
    assignPermissions,
    true
  );

  const form = useForm({
    resolver: zodResolver(rolePermissionsSchema),
    defaultValues: {
      permissions: props.assigned,
      name: props.roles.some(r => r.name === role) ? role : props.roles[0].name
    }
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
    <div className="flex h-full flex-col lg:mx-auto lg:w-10/12">
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
              className="space-y-2"
              id="role-permissions-form"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        name="role"
                        value={field.value}
                        onValueChange={role => {
                          field.onChange(role);
                          updateParam('role', role);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {props.roles.map(role => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
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
                name="permissions"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={props.permissions}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                        placeholder="Select permissions..."
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
            type="submit"
            disabled={pending}
            className="cursor-pointer"
            form="role-permissions-form"
          >
            {pending ? 'Assigning permissions...' : 'Assign permissions'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
