'use client';

import { Button } from '@/components/ui/button';

type Props = {
  reset: () => void;
  error: Error & { digest?: string };
};

export default function Error({ error, reset }: Props) {
  return (
    <main className="row-start-2 grid place-items-center">
      <section className="space-y-4 text-center">
        <h1 className="text-xl font-bold">{error.message}</h1>
        <Button
          variant="secondary"
          className="cursor-pointer"
          onClick={() => reset()}
        >
          Try again
        </Button>
      </section>
    </main>
  );
}
