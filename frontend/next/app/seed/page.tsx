'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import seed from '@/lib/actions';
import * as CN from '@/components/ui/card';
import { seedSchema } from '@/lib/schemas';
import * as RHF from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

export default function Page() {
  const form = useForm({ resolver: zodResolver(seedSchema) });
  const { handleSubmit, pending } = useHookForm(handler, seed);

  return (
    <section className="col-span-2 grid place-items-center place-self-center">
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Seed Database</CN.CardTitle>
          <CN.CardDescription>
            This will populate the database with predefined roles, permissions,
            and default users. Useful for development or resetting demo
            environments.
          </CN.CardDescription>
        </CN.CardHeader>
        <CN.CardContent>
          <RHF.Form {...form}>
            <form
              id="seed-form"
              className="space-y-2"
              onSubmit={form.handleSubmit(handleSubmit)}
            ></form>
          </RHF.Form>
        </CN.CardContent>
        <CN.CardFooter className="block">
          <Button
            type="submit"
            form="seed-form"
            disabled={pending}
            className="w-full cursor-pointer"
          >
            {pending ? 'Seeding...' : 'Seed database'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
