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
        <section className="col-span-2 grid place-self-center">
          <p className="text-destructive animate-pulse font-semibold">
            Verifying...
          </p>
        </section>
      }
    >
      <section className="col-span-2 grid place-items-center gap-2 place-self-center">
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

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="col-span-2 grid place-items-center gap-2 place-self-center">
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
