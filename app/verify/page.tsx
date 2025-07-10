import Link from 'next/link';
import { Suspense } from 'react';

import { verifyToken } from '@/lib/actions';
import { Button } from '@/components/ui/button';

type Props = { searchParams: Promise<{ [key: string]: string | undefined }> };

async function Verify({ token }: { token: string }) {
  const { error, success } = await verifyToken(token);

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
        {error && (
          <>
            <p className="text-destructive font-semibold">{error}</p>
            <Button>
              <Link href="/">Home</Link>
            </Button>
          </>
        )}
        {success && (
          <>
            <p className="font-semibold">{success}</p>
            <Button>
              <Link href="/login">Login</Link>
            </Button>
          </>
        )}
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
          <Link href="/">Home</Link>
        </Button>
      </section>
    );
  }

  return <Verify token={token} />;
}
