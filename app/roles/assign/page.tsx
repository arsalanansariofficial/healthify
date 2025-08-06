import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from './component';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';

export default async function Page() {
  const session = await auth();
  const roles = await prisma.role.findMany();

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          user={session?.user as User}
          roles={roles.map(r => ({ label: r.name, value: r.id }))}
        />
      </main>
    </Session>
  );
}
