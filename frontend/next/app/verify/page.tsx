import Link from 'next/link';
import { Suspense } from 'react';

import { cn } from '@/lib/utils';
import { verifyToken } from '@/lib/actions';
import { HOME, LOGIN } from '@/lib/constants';
import { Button } from '@/components/ui/button';

type Props = { searchParams: Promise<{ [key: string]: string | undefined }> };

async function Verify({ token }: { token: string }) {
  const { message, success } = await verifyToken(token);

  return (
    <Suspense
      fallback={
        <main className="row-start-2 mx-8 grid place-items-center">
          <section className="space-y-4 text-center">
            <p className="text-destructive animate-pulse font-semibold">
              Verifying...
            </p>
          </section>
        </main>
      }
    >
      <main className="row-start-2 mx-8 grid place-items-center">
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
      </main>
    </Suspense>
  );
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="row-start-2 mx-8 grid place-items-center">
        <section className="space-y-4 text-center">
          <p className="text-destructive font-semibold">
            Missing verification token!
          </p>
          <Button>
            <Link href={HOME}>Home</Link>
          </Button>
        </section>
      </main>
    );
  }

  return <Verify token={token} />;
}
