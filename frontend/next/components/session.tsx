'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function Session({
  expires,
  children
}: {
  expires: string;
  children: Readonly<React.ReactNode>;
}) {
  useEffect(() => {
    const timer = setTimeout(signOut, new Date(expires).getTime() - Date.now());
    return () => clearTimeout(timer);
  }, [expires]);

  return children;
}
