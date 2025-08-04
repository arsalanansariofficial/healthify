'use client';

import z from 'zod';
import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import * as CN from '@/components/ui/card';
import * as RHF from '@/components/ui/form';
import { assignRoles } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { userRolesSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import MultiSelect from '@/components/ui/multi-select';

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
      roles: user.roles.map(r => r.id)
    }
  });

  return (
    <section className="col-span-2 space-y-4 xl:col-span-1 xl:col-start-2">
      <header>
        <CN.Card>
          <CN.CardContent>
            <h1 className="font-semibold">Assign Roles</h1>
          </CN.CardContent>
        </CN.Card>
      </header>
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Assign roles</CN.CardTitle>
          <CN.CardDescription>
            Select the roles from the list that you want to assign
          </CN.CardDescription>
        </CN.CardHeader>
        <CN.CardContent>
          <RHF.Form {...form}>
            <form
              id="roles-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <RHF.FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Name</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input disabled {...field} type="text" />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Email</RHF.FormLabel>
                    <RHF.FormControl>
                      <Input disabled {...field} type="email" />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
              <RHF.FormField
                name="roles"
                control={form.control}
                render={({ field }) => (
                  <RHF.FormItem>
                    <RHF.FormLabel>Roles</RHF.FormLabel>
                    <RHF.FormControl>
                      <MultiSelect
                        options={roles}
                        selectedValues={field.value}
                        setSelectedValues={field.onChange}
                      />
                    </RHF.FormControl>
                    <RHF.FormMessage />
                  </RHF.FormItem>
                )}
              />
            </form>
          </RHF.Form>
        </CN.CardContent>
        <CN.CardFooter>
          <Button
            type="submit"
            form="roles-form"
            disabled={pending}
            className="cursor-pointer"
          >
            {pending ? 'Adding roles...' : 'Add roles'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
