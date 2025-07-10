'use client';

import { Button } from '@/components/ui/button';

type Props = {
  reset: () => void;
  error: Error & { digest?: string };
};

export default function Error({ error, reset }: Props) {
  return (
    <section className="col-span-2 space-y-4 place-self-center text-center lg:col-start-2">
      <h1 className="text-xl font-bold">{error.message}</h1>
      <Button
        variant="secondary"
        className="cursor-pointer"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </section>
  );
}
