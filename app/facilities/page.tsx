import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/facilities/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const facilities = await prisma.facility.findMany();

  return (
    <Session expiresAt={session.user.expiresAt}>
      <Header user={session.user} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-12">
        <Sidebar user={session.user} />
        <Component
          user={session.user}
          facilities={facilities}
          key={facilities.map(f => f.updatedAt).toString()}
        />
      </main>
    </Session>
  );
}
