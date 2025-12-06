'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import { LOGIN } from '@/lib/constants';

type Props = { children: React.ReactNode; expiresAt: number | undefined };

export default function Session({ children, expiresAt }: Props) {
  const params = usePathname();

  useEffect(() => {
    let timeout;

    if (expiresAt) {
      setTimeout(async () => {
        await signOut({
          redirectTo: `${LOGIN}?redirectTo=${encodeURIComponent(params || String())}`
        });
      }, expiresAt - Date.now());
    }

    return () => clearTimeout(timeout);
  }, [params, expiresAt]);

  return children;
}
