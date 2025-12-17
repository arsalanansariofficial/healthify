'use client';

import Info from '@/components/info';
import { ENVIRONMENT } from '@/lib/constants';

export default function Page({
  error
}: {
  reset: () => void;
  error: Error & { digest?: string };
}) {
  return (
    <main className="grid min-h-screen place-items-center">
      <section className="space-y-4 text-center">
        <Info
          title="500 - Internal Server Error"
          message={
            !ENVIRONMENT.IS_PRODUCTION
              ? error.message
              : 'There is some error while processing your request, please try again after some time!'
          }
        />
      </section>
    </main>
  );
}
