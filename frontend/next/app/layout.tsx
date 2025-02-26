import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Playfair_Display } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

import '@/app/globals.css';

type Props = Readonly<{ children: React.ReactNode }>;

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif'
});

export const metadata: Metadata = {
  title: 'Next Auth',
  description: 'Created by Arsalan Ansari'
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} grid min-h-screen grid-rows-[auto_1fr_auto] gap-4 antialiased`}
      >
        <SessionProvider>
          <ThemeProvider enableSystem attribute="class" defaultTheme="system">
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
