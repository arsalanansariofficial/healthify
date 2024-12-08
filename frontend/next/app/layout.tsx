import type { Metadata } from 'next';

import Session from '@/app/session';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { getSessionUser } from '@/lib/actions';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';

import '@/app/globals.css';

type Props = Readonly<{ children: React.ReactNode }>;

export const metadata: Metadata = {
  title: 'Next Auth',
  description: 'Created by Arsalan Ansari'
};

export default async function RootLayout({ children }: Props) {
  const { user, session } = await getSessionUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grid min-h-screen grid-rows-[auto_1fr_auto] gap-4 antialiased">
        <ThemeProvider enableSystem attribute="class" defaultTheme="system">
          <SessionProvider>
            <Session expiresAt={session?.user?.expiresAt}>
              {user && <Header />}
              <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
                {user && <Sidebar user={user} />}
                {children}
              </main>
              <Toaster />
            </Session>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
