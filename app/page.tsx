import Link from 'next/link';

import { LOGIN } from '@/lib/constants';

export default function Page() {
  return (
    <main className="row-start-2 mx-8 grid place-items-center">
      <section className="space-y-4 text-center">
        <Link
          href={LOGIN}
          className="font-serif text-5xl font-semibold hover:underline hover:underline-offset-16"
        >
          Healthify
        </Link>
      </section>
    </main>
  );
}
