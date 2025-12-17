import Link from 'next/link';

import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="space-y-4 text-center">
      <h1 className="text-xl font-bold">{error}</h1>
      <Button>
        <Link href={ROUTES.HOME}>Home Page</Link>
      </Button>
    </section>
  );
}
