'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  return (
    <main className="row-start-2 grid place-items-center">
      <section className="space-y-2 text-center">
        <h1 className="text-xl font-bold">{authError}</h1>
        <Link
          href="/"
          className="cursor-pointer font-semibold underline-offset-2 hover:underline"
        >
          Home Page
        </Link>
      </section>
    </main>
  );
}
