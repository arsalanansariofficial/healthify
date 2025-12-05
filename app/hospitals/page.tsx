import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/hospitals/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const hospitals = await prisma.hospital.findMany();

  return (
    <Session expiresAt={session.user.expiresAt}>
      <Header user={session.user} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-12">
        <Sidebar user={session.user} />
        <Component
          user={session.user}
          hospitals={hospitals}
          key={hospitals.map(h => h.updatedAt).toString()}
        />
      </main>
    </Session>
  );
}
