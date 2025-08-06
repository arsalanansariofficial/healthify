'use client';

import { User } from 'next-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
import * as CN from '@/components/ui/card';
import Sidebar from '@/components/sidebar';
import * as RHF from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addPermission } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';
import { permissionSchema } from '@/lib/schemas';

export default function Component({ user }: { user: User }) {
  const { pending, handleSubmit } = useHookForm(handler, addPermission);

  const form = useForm({
    resolver: zodResolver(permissionSchema),
    defaultValues: { name: String() }
  });

  return (
    <div className="grid h-full xl:grid-cols-[1fr_auto] xl:gap-12">
      <section className="flex flex-col gap-8 lg:mx-auto lg:w-10/12">
        <CN.Card>
          <CN.CardHeader>
            <CN.CardTitle>Add permission</CN.CardTitle>
            <CN.CardDescription>
              Enter a name for a permission that you want to add
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardContent>
            <RHF.Form {...form}>
              <form
                id="permission-form"
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
                        <Input
                          {...field}
                          type="text"
                          placeholder="VIEW:DASHBOARD"
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
              disabled={pending}
              form="permission-form"
              className="cursor-pointer"
            >
              {pending ? 'Adding permission...' : 'Add permission'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
        <Footer />
      </section>
      <div className="hidden xl:block">
        <Sidebar user={user} />
      </div>
    </div>
  );
}
