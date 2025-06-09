'use client';

import Info from '@/components/info';
import { IS_PRODUCTION } from '@/lib/constants';

type Props = { reset: () => void; error: Error & { digest?: string } };

export default function Error({ error }: Props) {
  return (
    <main className="row-start-2 mx-8 grid place-items-center">
      <section className="space-y-4 text-center">
        <Info
          title="500 - Internal Server Error"
          message={
            !IS_PRODUCTION
              ? error.message
              : 'There is some error while processing your request, please try again after some time!'
          }
        />
      </section>
    </main>
  );
}
