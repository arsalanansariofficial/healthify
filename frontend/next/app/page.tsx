import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <section className="col-span-2 grid place-items-center gap-2 place-self-center">
      <h1 className="text-3xl font-bold">Next-Auth</h1>
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    </section>
  );
}
