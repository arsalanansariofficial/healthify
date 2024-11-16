'use client';

import { toast } from 'sonner';
import { useActionState } from 'react';

import * as CN from '@/components/ui/card';
import { addPermission } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    const result = await addPermission(prevState, formData);

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

  return (
    <section className="col-span-2 grid place-items-center gap-4 place-self-center lg:col-start-2">
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Login to your account</CN.CardTitle>
          <CN.CardDescription>
            Enter your email below to login to your account
          </CN.CardDescription>
        </CN.CardHeader>
        <CN.CardContent>
          <form id="permission-form" className="space-y-2">
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
          </form>
        </CN.CardContent>
        <CN.CardFooter>
          <Button
            type="submit"
            disabled={pending}
            formAction={action}
            form="permission-form"
            className="w-full cursor-pointer"
          >
            {pending ? 'Adding permission...' : 'Add permission'}
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
