import type { Metadata } from 'next';

import { config } from '@fortawesome/fontawesome-svg-core';
import { SessionProvider } from 'next-auth/react';
import { Inter, Playfair_Display } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import '@fortawesome/fontawesome-svg-core/styles.css';

import '@/app/globals.css';

type Props = Readonly<{ children: React.ReactNode }>;

config.autoAddCss = false;
const serif = Inter({ subsets: ['latin'], variable: '--font-sans' });
const sans = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  description: 'Created by Arsalan Ansari',
  title: 'Healthify'
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${serif.variable} ${sans.variable} grid min-h-screen grid-rows-[auto_1fr] font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider enableSystem attribute='class' defaultTheme='system'>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
