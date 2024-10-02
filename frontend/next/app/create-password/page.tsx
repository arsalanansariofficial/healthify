import Link from 'next/link';
import { Suspense } from 'react';

import { verifyToken } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Component from '@/app/create-password/component';

type Props = { searchParams: Promise<{ [key: string]: string | undefined }> };

async function Verify({ token }: { token: string }) {
  const { error, email, success } = await verifyToken(token);

  return (
    <main className="row-start-2 grid place-items-center p-4">
      {error && (
        <section className="grid place-items-center gap-2">
          <p className="text-destructive font-semibold">{error}</p>
          <Button>
            <Link href="/">Home</Link>
          </Button>
        </section>
      )}
      {success && (
        <section>
          <Component email={email} />
        </section>
      )}
    </main>
  );
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="row-start-2 grid place-items-center p-4">
        <section className="grid place-items-center gap-2">
          <p className="text-destructive font-semibold">
            Missing verification token!
          </p>
          <Button>
            <Link href="/">Home</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="row-start-2 grid place-items-center p-4">
          <section className="grid place-items-center gap-2">
            <p className="text-destructive animate-pulse font-semibold">
              Verifying...
            </p>
          </section>
        </main>
      }
    >
      <Verify token={token} />
    </Suspense>
  );
}
