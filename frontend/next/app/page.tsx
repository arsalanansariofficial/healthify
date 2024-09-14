import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <main className="row-start-2 grid place-items-center">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Next-Auth</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </section>
    </main>
  );
}
