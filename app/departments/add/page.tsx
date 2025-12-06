import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/departments/add/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  return (
    <Session expiresAt={session.user.expiresAt}>
      <Header user={session.user} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session.user} />
        <Component />
      </main>
    </Session>
  );
}
