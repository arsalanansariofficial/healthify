import Link from 'next/link';

import { ROUTES } from '@/lib/constants';

export default function Page() {
  return (
    <section>
      <Link
        href={ROUTES.LOGIN}
        className='font-serif text-5xl font-semibold hover:underline hover:underline-offset-16'
      >
        Healthify
      </Link>
    </section>
  );
}
