'use client';

import { toast } from 'sonner';
import { useActionState } from 'react';

import seed from '@/lib/actions';
import * as CN from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Page() {
  const actionState = useActionState(async function () {
    const result = await seed();

    if (result?.success) {
      toast(result.message, {
        position: 'top-center',
        description: (
          <span className="text-foreground">
            {new Date().toLocaleString('en-US', {
              hour12: true,
              month: 'long',
              day: '2-digit',
              weekday: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </span>
        )
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className="text-destructive">{result?.message}</h2>, {
        position: 'top-center',
        description: (
          <p className="text-destructive">
            {new Date().toLocaleString('en-US', {
              hour12: true,
              month: 'long',
              day: '2-digit',
              weekday: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        )
      });
    }

    return result;
  }, undefined);

  const [action, pending] = [actionState[1], actionState[2]];

  return (
    <main className="row-start-2 grid place-items-center">
      <section className="grid place-items-center p-4">
        <CN.Card className="min-w-sm">
          <CN.CardHeader>
            <CN.CardTitle>Seed Database</CN.CardTitle>
            <CN.CardDescription>
              This will populate the database with predefined roles,
              permissions, and default users. Useful for development or
              resetting demo environments.
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardFooter className="block">
            <form action={action} className="w-full">
              <Button
                type="submit"
                disabled={pending}
                className="w-full cursor-pointer"
              >
                {pending ? 'Seeding...' : 'Seed database'}
              </Button>
            </form>
          </CN.CardFooter>
        </CN.Card>
      </section>
    </main>
  );
}
