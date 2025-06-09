'use client';

import { useActionState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgetPassword } from '@/lib/actions';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(forgetPassword, undefined);

  return (
    <main className="row-start-2 grid grid-rows-1 p-4">
      <section className="grid place-items-center gap-4 place-self-center">
        <form
          action={action}
          className="min-w-sm space-y-4 rounded-md border border-dashed p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={state?.email}
              placeholder="your.name@domain.com"
            />
            {state?.errors?.email && (
              <p className="text-destructive text-xs">{state.errors.email}</p>
            )}
          </div>
          {state?.message && (
            <p className="text-destructive text-xs">{state.message}</p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="w-full cursor-pointer"
          >
            {!pending ? 'Forget' : 'Resetting...'}
          </Button>
        </form>
      </section>
    </main>
  );
}
