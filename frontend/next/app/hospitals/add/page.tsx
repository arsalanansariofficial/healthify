import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { DOCTOR_ROLE } from '@/lib/constants';
import Component from '@/app/hospitals/add/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  return (
    <Session expiresAt={session.user.expiresAt}>
      <Header user={session.user} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session.user} />
        <Component
          users={await prisma.user.findMany({
            where: { UserRoles: { some: { role: { name: DOCTOR_ROLE } } } }
          })}
        />
      </main>
    </Session>
  );
}
