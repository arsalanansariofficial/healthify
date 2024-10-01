'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn } from 'next-auth/react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { signup } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <main className="row-start-2 grid grid-rows-1 p-4">
      <section className="place-self-center">
        <form
          action={action}
          className="min-w-sm space-y-4 rounded-md border border-dashed p-4"
        >
          <div className="space-y-1">
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
          <div className="space-y-1">
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
          <div className="space-y-1">
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
            {!pending ? 'Signup' : 'Signing Up...'}
          </Button>
        </form>
      </section>
      <footer className="grid place-items-center gap-1">
        <button onClick={() => signIn('github')} className="cursor-pointer">
          <FontAwesomeIcon icon={faGithub} size="lg" />
        </button>
        <Link
          href="/login"
          className="font-semibold underline-offset-2 hover:underline"
        >
          Already have an account? Login
        </Link>
      </footer>
    </main>
  );
}
