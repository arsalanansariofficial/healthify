import type { Metadata } from 'next';

import { config } from '@fortawesome/fontawesome-svg-core';
import { SessionProvider } from 'next-auth/react';
import { Inter, Playfair_Display } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';
import '@fortawesome/fontawesome-svg-core/styles.css';

import '@/app/globals.css';

config.autoAddCss = false;
const serif = Inter({ subsets: ['latin'], variable: '--font-sans' });
const sans = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  description: 'Created by Arsalan Ansari',
  title: 'Healthify'
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${serif.variable} ${sans.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
