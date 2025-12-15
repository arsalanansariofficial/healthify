import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/roles/assign/component';

export default async function Page() {
  const session = await auth();
  const roles = await prisma.role.findMany();

  return (
    <Component
      user={session?.user as User}
      roles={roles.map(r => ({ label: r.name, value: r.id }))}
    />
  );
}
