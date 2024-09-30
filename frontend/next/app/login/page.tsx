'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { login } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  let oAuthError;
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState(login, undefined);

  if (searchParams.get('error') === 'OAuthAccountNotLinked') {
    oAuthError = 'Email already registered with another provider.';
  }

  return (
    <main className="row-start-2 grid grid-rows-1 p-4">
      <section className="place-self-center p-4">
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
          {oAuthError && (
            <p className="text-destructive text-xs">{oAuthError}</p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="w-full cursor-pointer"
          >
            {!pending ? 'Login' : 'Logging In...'}
          </Button>
        </form>
      </section>
      <footer className="grid place-items-center gap-1">
        <button onClick={() => signIn('github')} className="cursor-pointer">
          <FontAwesomeIcon icon={faGithub} size="lg" />
        </button>
        <Link
          href="/signup"
          className="font-semibold underline-offset-2 hover:underline"
        >
          Don&apos;t have an account? Signup
        </Link>
      </footer>
    </main>
  );
}
