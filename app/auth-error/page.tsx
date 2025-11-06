import { Suspense } from 'react';

import Component from './component';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="row-start-2 mx-8 grid place-items-center">
          <section className="space-y-4 text-center">
            <p className="animate-pulse font-semibold">Loading...</p>
          </section>
        </main>
      }
    >
      <Component />
    </Suspense>
  );
}
