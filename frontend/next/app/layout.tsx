import type { Metadata } from 'next';

import '@/app/globals.css';

type Props = Readonly<{ children: React.ReactNode }>;

export const metadata: Metadata = {
  title: 'Next Auth',
  description: 'Created by Arsalan Ansari'
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className="grid min-h-screen grid-rows-[auto_1fr_auto] antialiased">
        {children}
      </body>
    </html>
  );
}
