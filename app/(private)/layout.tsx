import { auth } from '@/auth';
import { ROUTES } from '@/lib/constants';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Session from '@/components/session';
import { redirect } from 'next/navigation';

export default async function Layout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session || !session.expires || !session.user) redirect(ROUTES.LOGIN);

  return (
    <Session expires={session.expires}>
      <Header user={session.user} />
      <main className='row-start-2 overflow-x-auto px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12 lg:overflow-x-visible'>
        <Sidebar user={session.user} />
        {children}
      </main>
    </Session>
  );
}
