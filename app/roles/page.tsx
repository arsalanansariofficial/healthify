'use client';

import { useActionState } from 'react';

import { addRole } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(addRole, undefined);

  return (
    <main className="row-start-2 grid place-items-center">
      <section className="grid place-items-center p-4">
        <form
          action={action}
          className="min-w-sm space-y-4 rounded-md border border-dashed p-4 shadow"
        >
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              type="text"
              placeholder="user"
              defaultValue={state?.role}
            />
            {state?.errors?.role && (
              <p className="text-destructive text-xs">{state.errors.role}</p>
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
            {pending ? 'Adding role...' : 'Add Role'}
          </Button>
        </form>
      </section>
    </main>
  );
}
