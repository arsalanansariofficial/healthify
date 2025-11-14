'use client';

import Info from '@/components/info';

export default function Page() {
  return (
    <main className="row-start-2 mx-8 grid place-items-center">
      <section className="space-y-4 text-center">
        <Info
          title="404 - Not Found"
          message="The page you're looking for doesn't exist. Try searching for
          what you need below."
        />
      </section>
    </main>
  );
}
