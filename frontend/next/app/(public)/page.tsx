import Link from 'next/link';

import { ROUTES } from '@/lib/constants';

export default function Page() {
  return (
    <section>
      <Link
        className='font-serif text-5xl font-semibold hover:underline hover:underline-offset-16'
        href={ROUTES.LOGIN}>
        Healthify
      </Link>
    </section>
  );
}
