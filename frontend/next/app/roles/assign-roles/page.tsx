import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/roles/assign-roles/component';

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
