import Link from 'next/link';
import { Suspense } from 'react';

import { HOME } from '@/lib/constants';
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
          <Link href={HOME}>Home</Link>
        </Button>
      </CN.CardFooter>
    </CN.Card>
  );
}

async function Verify({ token }: { token: string }) {
  const { email, success, message } = await verifyToken(token);

  return (
    <section className="col-span-2 grid place-items-center place-self-center">
      {!success && <ErrorCard message={message} />}
      {success && <Component email={email as string} />}
    </section>
  );
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="col-span-2 grid place-items-center place-self-center">
        <ErrorCard message="Missing verification token" />
      </section>
    );
  }

  return (
    <Suspense
      fallback={
        <section className="col-span-2 grid place-items-center place-self-center">
          <p className="text-destructive animate-pulse font-semibold">
            Verifying...
          </p>
        </section>
      }
    >
      <Verify token={token} />
    </Suspense>
  );
}
