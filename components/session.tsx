'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function Session({
  children,
  expires
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
