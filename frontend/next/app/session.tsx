'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

import { LOGIN } from '@/lib/constants';

type Props = { children: React.ReactNode; expiresAt: number | undefined };

export default function Session({ children, expiresAt }: Props) {
  useEffect(() => {
    let timeout;

    if (expiresAt) {
      setTimeout(async () => {
        await signOut({ redirectTo: LOGIN });
      }, expiresAt - Date.now());
    }

    return () => clearTimeout(timeout);
  }, [expiresAt]);

  return children;
}
