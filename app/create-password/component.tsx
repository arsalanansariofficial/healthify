'use client';

import { useActionState } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updatePassword } from '@/lib/actions';
import { Button } from '@/components/ui/button';

export default function Component({ email }: { email: string }) {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <main className="row-start-2 grid grid-rows-1 p-4">
      <section className="grid place-items-center gap-4 place-self-center">
        <form
          action={action}
          className="min-w-sm space-y-4 rounded-md border border-dashed p-4"
        >
          <div className="space-y-2">
            <Input id="email" name="email" type="hidden" value={email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password@123"
              defaultValue={state?.password}
            />
            {state?.errors?.password && (
              <p className="text-destructive text-xs">
                {state.errors.password}
              </p>
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
            {!pending ? 'Update' : 'Updaing Password...'}
          </Button>
        </form>
      </section>
    </main>
  );
}
