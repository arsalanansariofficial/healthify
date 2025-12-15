import Link from 'next/link';

import { LOGIN } from '@/lib/constants';

export default function Page() {
  return (
    <section>
      <Link
        href={LOGIN}
        className="font-serif text-5xl font-semibold hover:underline hover:underline-offset-16"
      >
        Healthify
      </Link>
    </section>
  );
}
