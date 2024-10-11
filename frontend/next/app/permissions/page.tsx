'use client';

import { useActionState } from 'react';

import { addPermission } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(addPermission, undefined);

  return (
    <main className="row-start-2 grid place-items-center">
      <section className="grid place-items-center p-4">
        <form
          action={action}
          className="min-w-sm space-y-4 rounded-md border border-dashed p-4 shadow"
        >
          <div className="space-y-2">
            <Label htmlFor="permission">Permission</Label>
            <Input
              type="text"
              id="permission"
              name="permission"
              placeholder="view:dashboard"
              defaultValue={state?.permission}
            />
            {state?.errors?.permission && (
              <p className="text-destructive text-xs">
                {state.errors.permission}
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
            {pending ? 'Adding permission...' : 'Add Permission'}
          </Button>
        </form>
      </section>
    </main>
  );
}
