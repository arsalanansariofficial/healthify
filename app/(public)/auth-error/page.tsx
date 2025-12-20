import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className='space-y-4 text-center'>
      <h1 className='text-xl font-bold'>{error}</h1>
      <Button>
        <Link href={ROUTES.HOME}>Home Page</Link>
      </Button>
    </section>
  );
}
