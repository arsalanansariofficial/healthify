'use client';

import { toast } from 'sonner';
import { useActionState } from 'react';

import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgetPassword } from '@/lib/actions';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    const result = await forgetPassword(prevState, formData);

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
    <main className="row-start-2 grid grid-rows-1 p-4">
      <section className="grid place-items-center gap-4 place-self-center">
        <CN.Card className="min-w-sm">
          <CN.CardHeader>
            <CN.CardTitle>Reset your password</CN.CardTitle>
            <CN.CardDescription>
              Enter your email below to reset your password
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardContent>
            <form id="reset-form" className="space-y-2">
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
                  <p className="text-destructive text-xs">
                    {state.errors.email}
                  </p>
                )}
              </div>
            </form>
          </CN.CardContent>
          <CN.CardFooter className="grid gap-2">
            <Button
              type="submit"
              form="reset-form"
              disabled={pending}
              formAction={action}
              className="cursor-pointer"
            >
              {pending ? 'Sending...' : 'Send token'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </section>
    </main>
  );
}
