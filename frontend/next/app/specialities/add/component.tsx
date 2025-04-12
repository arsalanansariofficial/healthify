'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Footer from '@/components/footer';
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
    <div className="flex h-full flex-col gap-8 lg:mx-auto lg:w-10/12">
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
      <Footer />
    </div>
  );
}
