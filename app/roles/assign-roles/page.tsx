import { User } from 'next-auth';
import { PrismaClient } from '@prisma/client';

import { auth } from '@/auth';
import Component from '@/app/roles/assign-roles/component';

const prisma = new PrismaClient();

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
