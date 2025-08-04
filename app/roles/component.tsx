'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { addRole } from '@/lib/actions';
import * as CN from '@/components/ui/card';
import { roleSchema } from '@/lib/schemas';
import * as RHF from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

export default function Component() {
  const { pending, handleSubmit } = useHookForm(handler, addRole);

  const form = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: String() }
  });

  return (
    <section className="col-span-2 space-y-4 xl:col-span-1 xl:col-start-2">
      <header>
        <CN.Card>
          <CN.CardContent>
            <h1 className="font-semibold">Roles</h1>
          </CN.CardContent>
        </CN.Card>
      </header>
      <main>
        <CN.Card>
          <CN.CardHeader>
            <CN.CardTitle>Add roles</CN.CardTitle>
            <CN.CardDescription>
              Enter a name for a role that you want to add
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardContent>
            <RHF.Form {...form}>
              <form
                id="role-form"
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
                        <Input {...field} type="text" placeholder="USER" />
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
              form="role-form"
              disabled={pending}
              className="cursor-pointer"
            >
              {pending ? 'Adding role...' : 'Add role'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </main>
    </section>
  );
}
