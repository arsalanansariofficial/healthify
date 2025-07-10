'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { useActionState } from 'react';
import { signIn } from 'next-auth/react';

import { signup } from '@/lib/actions';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(async function (
    prevState: unknown,
    formData: FormData
  ) {
    const result = await signup(prevState, formData);

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
    <section className="col-span-2 grid place-items-center gap-4 place-self-center">
      <CN.Card className="min-w-sm">
        <CN.CardHeader>
          <CN.CardTitle>Create your account</CN.CardTitle>
          <CN.CardDescription>
            Enter your details below to create your account
          </CN.CardDescription>
          <CN.CardAction>
            <Button variant="link">
              <Link href="/login">Login</Link>
            </Button>
          </CN.CardAction>
        </CN.CardHeader>
        <CN.CardContent>
          <form id="signup-form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={state?.name}
                placeholder="Gwen Tennyson"
              />
              {state?.errors?.name && (
                <p className="text-destructive text-xs">{state.errors.name}</p>
              )}
            </div>
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
        <CN.CardFooter className="grid gap-2">
          <Button
            type="submit"
            form="signup-form"
            disabled={pending}
            formAction={action}
            className="cursor-pointer"
          >
            {pending ? 'Signing up...' : 'Signup'}
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => signIn('github')}
          >
            Login with GitHub
          </Button>
        </CN.CardFooter>
      </CN.Card>
    </section>
  );
}
