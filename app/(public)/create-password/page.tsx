import Link from 'next/link';
import { Suspense } from 'react';

import Component from '@/app/(public)/create-password/component';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardDescription
} from '@/components/ui/card';
import { verifyToken } from '@/lib/actions';
import { ROUTES } from '@/lib/constants';

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className='min-w-sm'>
      <CardHeader>
        <CardTitle>{message}</CardTitle>
        <CardDescription>
          Place your token in the url to verify your authenticity
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className='w-full'>
          <Link href={ROUTES.HOME}>Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

async function Verify({ token }: { token: string }) {
  const { email, message, success } = await verifyToken(token);

  return (
    <section className='col-span-2 grid place-items-center place-self-center'>
      {success && <Component email={email as string} />}
      {!success && <ErrorCard message={message as string} />}
    </section>
  );
}

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section>
        <ErrorCard message='Missing verification token' />
      </section>
    );
  }

  return (
    <Suspense
      fallback={
        <section>
          <p className='text-destructive animate-pulse font-semibold'>
            Verifying...
          </p>
        </section>
      }
    >
      <Verify token={token} />
    </Suspense>
  );
}
