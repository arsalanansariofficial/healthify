import Link from 'next/link';

import { HOME } from '@/lib/constants';
import { Button } from '@/components/ui/button';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="row-start-2 mx-8 grid place-items-center">
      <section className="space-y-4 text-center">
        <h1 className="text-xl font-bold">{error}</h1>
        <Button>
          <Link href={HOME}>Home Page</Link>
        </Button>
      </section>
    </main>
  );
}
