'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import * as CN from '@/components/ui/card';
import { nameSchema } from '@/lib/schemas';
import * as RHF from '@/components/ui/form';
import { addSpeciality } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

export default function Component() {
  const { pending, handleSubmit } = useHookForm(handler, addSpeciality);

  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: String() }
  });

  return (
    <section className="col-span-2 h-full space-y-4 xl:col-span-1 xl:col-start-2">
      <header>
        <CN.Card>
          <CN.CardContent>
            <h1 className="font-semibold">Speciality</h1>
          </CN.CardContent>
        </CN.Card>
      </header>
      <main className="mx-auto">
        <CN.Card>
          <CN.CardHeader>
            <CN.CardTitle>Add Speciality</CN.CardTitle>
            <CN.CardDescription>
              Add new speciality here. Click save when you&apos;re done.
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardContent>
            <RHF.Form {...form}>
              <form
                id="speciality-form"
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
                          className="capitalize"
                          placeholder="Physician"
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
            <Button type="submit" disabled={pending} form="speciality-form">
              {pending ? 'Saving...' : 'Save'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </main>
    </section>
  );
}
