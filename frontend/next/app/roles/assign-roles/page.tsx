import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/roles/assign-roles/component';

export default async function Page() {
  const session = await auth();
  const roles = await prisma.role.findMany();

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
        <Sidebar user={session?.user as User} />
        <Component
          user={session?.user as User}
          roles={roles.map(r => ({ label: r.name, value: r.id }))}
        />
      </main>
    </Session>
  );
}
