import { User } from 'next-auth';

import Component from '@/app/(private)/roles/assign/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  const roles = await prisma.role.findMany();

  return (
    <Component
      roles={roles.map(r => ({ label: r.name, value: r.id }))}
      user={session?.user as User}
    />
  );
}
