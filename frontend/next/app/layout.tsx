import type { Metadata } from 'next';

import '@/app/globals.css';

import { auth } from '@/auth';
import Session from '@/app/session';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

type Props = Readonly<{ children: React.ReactNode }>;

export const metadata: Metadata = {
  title: 'Next Auth',
  description: 'Created by Arsalan Ansari'
};

export default async function RootLayout({ children }: Props) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grid min-h-screen grid-rows-[auto_1fr_auto] antialiased">
        <ThemeProvider enableSystem attribute="class" defaultTheme="system">
          <Session expiresAt={session?.user?.expiresAt}>
            <Header />
            {children}
            <Toaster />
          </Session>
        </ThemeProvider>
      </body>
    </html>
  );
}
