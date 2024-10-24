import Link from 'next/link';
import { Suspense } from 'react';

import * as CN from '@/components/ui/card';
import { verifyToken } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Component from '@/app/create-password/component';

type Props = { searchParams: Promise<{ [key: string]: string | undefined }> };

function ErrorCard({ message }: { message: string }) {
  return (
    <CN.Card className="min-w-sm">
      <CN.CardHeader>
        <CN.CardTitle>{message}</CN.CardTitle>
        <CN.CardDescription>
          Place your token in the url to verify your authenticity
        </CN.CardDescription>
      </CN.CardHeader>
      <CN.CardFooter>
        <Button className="w-full">
          <Link href="/">Home</Link>
        </Button>
      </CN.CardFooter>
    </CN.Card>
  );
}

async function Verify({ token }: { token: string }) {
  const { error, email, success } = await verifyToken(token);

  return (
    <main className="row-start-2 grid place-items-center p-4">
      <section className="grid place-items-center gap-4 place-self-center">
        {error && <ErrorCard message={error} />}
        {success && <Component email={email} />}
      </section>
    </main>
  );
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="row-start-2 grid place-items-center p-4">
        <section className="grid place-items-center gap-2">
          <ErrorCard message="Missing verification token" />
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
