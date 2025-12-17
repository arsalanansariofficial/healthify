import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ROUTES } from '@/lib/constants';

export default async function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (session && session.expires && session.user) redirect(ROUTES.DASHBOARD);

  return (
    <main className="grid min-h-screen place-items-center px-8 py-4">
      {children}
    </main>
  );
}
