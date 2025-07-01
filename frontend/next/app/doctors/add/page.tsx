import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/doctors/add/component';

export default async function Page() {
  const session = await auth();

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          user={session?.user as User}
          specialities={(await prisma.speciality.findMany()).map(s => ({
            value: s.id,
            label: s.name
          }))}
        />
      </main>
    </Session>
  );
}
