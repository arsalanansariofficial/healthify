import Link from 'next/link';
import { Suspense } from 'react';

import { cn } from '@/lib/utils';
import { verifyToken } from '@/lib/actions';
import { HOME, LOGIN } from '@/lib/constants';
import { Button } from '@/components/ui/button';

async function Verify({ token }: { token: string }) {
  const { message, success } = await verifyToken(token);

  return (
    <Suspense
      fallback={
        <section className="space-y-4 text-center">
          <p className="text-destructive animate-pulse font-semibold">
            Verifying...
          </p>
        </section>
      }
    >
      <section className="space-y-4 text-center">
        <p className={cn('font-semibold', { 'text-destructive': !success })}>
          {message}
        </p>
        <Button>
          <Link href={!success ? HOME : LOGIN}>
            {!success ? 'Home' : 'Login'}
          </Link>
        </Button>
      </section>
    </Suspense>
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
      <section className="space-y-4 text-center">
        <p className="text-destructive font-semibold">
          Missing verification token!
        </p>
        <Button>
          <Link href={HOME}>Home</Link>
        </Button>
      </section>
    );
  }

  return <Verify token={token} />;
}
