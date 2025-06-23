import type { Metadata } from 'next';

import '@/app/globals.css';

import { auth } from '@/auth';
import Session from '@/app/session';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/sonner';

type Props = Readonly<{ children: React.ReactNode }>;

export const metadata: Metadata = {
  title: 'Next Auth',
  description: 'Created by Arsalan Ansari'
};

export default async function RootLayout({ children }: Props) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="grid min-h-screen grid-rows-[auto_1fr_auto] antialiased">
        <Header />
        <Session expiresAt={session?.user?.expiresAt}>{children}</Session>
        <Toaster />
      </body>
    </html>
  );
}
