'use client';

import { toast } from 'sonner';
import { useActionState } from 'react';

import { getDate } from '@/lib/utils';
import { addRole } from '@/lib/actions';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    const result = await addRole(prevState, formData);

    if (result?.success) {
      toast(result.message, {
        position: 'top-center',
        description: <span className="text-foreground">{getDate()}</span>
      });
    }

    if (!result?.success && result?.message) {
      toast(<h2 className="text-destructive">{result?.message}</h2>, {
        position: 'top-center',
        description: <p className="text-destructive">{getDate()}</p>
      });
    }

    return result;
  }, undefined);

  return (
    <section className="col-span-2 grid place-items-center gap-4 place-self-center lg:col-start-2">
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Add roles</CN.CardTitle>
          <CN.CardDescription>
            Enter a name for a role that you want to add
          </CN.CardDescription>
        </CN.CardHeader>
        <CN.CardContent>
          <form id="role-form" className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                name="role"
                placeholder="user"
                defaultValue={state?.role}
              />
              {state?.errors?.role && (
                <p className="text-destructive text-xs">{state.errors.role}</p>
              )}
            </div>
          </form>
        </CN.CardContent>
        <CN.CardFooter>
          <Button
            type="submit"
            form="role-form"
            disabled={pending}
            formAction={action}
            className="w-full cursor-pointer"
          >
            {pending ? 'Adding role...' : 'Add role'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
