'use client';

import z from 'zod';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
import { assignRoles } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { userRolesSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
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
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription
} from '@/components/ui/card';

type Props = { user: User; roles: { label: string; value: string }[] };

export default function Component({ user, roles }: Props) {
  const { pending, handleSubmit } = useHookForm(
    handler,
    assignRoles.bind(null, user.id as string) as (
      data: z.infer<typeof userRolesSchema>
    ) => Promise<unknown>,
    true
  );

  const form = useForm({
    resolver: zodResolver(userRolesSchema),
    defaultValues: {
      name: user.name as string,
      email: user.email as string,
      roles: user.roles?.map(r => r.id) || []
    }
  });

  return (
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
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
              id="roles-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input disabled {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="roles"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={roles}
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
            type="submit"
            form="roles-form"
            disabled={pending}
            className="cursor-pointer"
          >
            {pending ? 'Adding roles...' : 'Add roles'}
          </Button>
        </CardFooter>
      </Card>
      <Footer />
    </div>
  );
}
