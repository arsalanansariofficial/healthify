'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function Router({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        router.push(`/${formData.get('search') as string}`);
      }}
    >
      {children}
    </form>
  );
}
