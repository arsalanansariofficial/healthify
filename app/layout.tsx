import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inter, Playfair_Display } from 'next/font/google';
import { config } from '@fortawesome/fontawesome-svg-core';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

import '@/app/globals.css';

type Props = Readonly<{ children: React.ReactNode }>;

config.autoAddCss = false;
const serif = Inter({ subsets: ['latin'], variable: '--font-sans' });
const sans = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Healthify',
  description: 'Created by Arsalan Ansari'
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
