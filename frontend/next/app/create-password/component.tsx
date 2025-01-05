'use client';

import { toast } from 'sonner';
import { useActionState } from 'react';

import { getDate } from '@/lib/utils';
import * as CN from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updatePassword } from '@/lib/actions';
import { Button } from '@/components/ui/button';

export default function Component({ email }: { email: string }) {
  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    const result = await updatePassword(prevState, formData);

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
    <CN.Card className="min-w-sm">
      <CN.CardHeader>
        <CN.CardTitle>Reset your password</CN.CardTitle>
        <CN.CardDescription>
          Enter a new password below to reset your account&apos;s password
        </CN.CardDescription>
      </CN.CardHeader>
      <CN.CardContent>
        <form id="reset-form" className="space-y-2">
          <Input id="email" name="email" type="hidden" value={email} />
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
        </form>
      </CN.CardContent>
      <CN.CardFooter>
        <Button
          type="submit"
          form="reset-form"
          disabled={pending}
          formAction={action}
          className="w-full cursor-pointer"
        >
          {pending ? 'Updating password...' : 'Reset password'}
        </Button>
      </CN.CardFooter>
    </CN.Card>
  );
}
