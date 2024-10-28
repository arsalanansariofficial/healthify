'use client';

import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import { useActionState, useState } from 'react';

import { User } from '@/lib/types';
import * as CN from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateUser, FormState } from '@/lib/actions';

export default function Component({ user }: { user: User }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [state, action, pending] = useActionState(
    async function (prevState: unknown, formData: FormData) {
      const result = await updateUser(user.id, prevState, formData);

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
    },
    { name: user.name, email: user.email } as FormState
  );

  return (
    <main className="row-start-2 grid place-items-center">
      <section className="grid place-items-center p-4">
        <CN.Card className="min-w-sm">
          <CN.CardHeader>
            <CN.CardTitle>Update your profile</CN.CardTitle>
            <CN.CardDescription>
              Update below given fields to update your account profile
            </CN.CardDescription>
          </CN.CardHeader>
          <CN.CardContent>
            <form id="dashboard-form" className="space-y-2">
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
                  <p className="text-destructive text-xs">
                    {state.errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={state?.email}
                  placeholder="yourname@domain.com"
                />
                {state?.errors?.email && (
                  <p className="text-destructive text-xs">
                    {state.errors.email}
                  </p>
                )}
              </div>
              {!user.hasOAuth && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Secret@123"
                    defaultValue={state?.password}
                  />
                  {state?.errors?.password && (
                    <p className="text-destructive text-xs">
                      {state.errors.password}
                    </p>
                  )}
                </div>
              )}
            </form>
          </CN.CardContent>
          <CN.CardFooter className="grid gap-2">
            <Button
              type="submit"
              disabled={pending}
              formAction={action}
              form="dashboard-form"
              className="cursor-pointer"
            >
              {pending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={async () => {
                setIsSigningOut(true);
                await signOut();
              }}
            >
              {isSigningOut ? 'Signing out...' : 'Signout'}
            </Button>
          </CN.CardFooter>
        </CN.Card>
      </section>
    </main>
  );
}
