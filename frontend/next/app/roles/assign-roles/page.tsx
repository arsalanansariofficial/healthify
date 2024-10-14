import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

import { auth } from '@/auth';
import Component from '@/app/roles/assign-roles/component';

const prisma = new PrismaClient();

export default async function Page() {
  const session = await auth();
  const roles = await prisma.role.findMany();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { roles: { include: { permissions: true } } }
  });

  if (!user) redirect('/login');
  return <Component user={user!} roles={roles} />;
}
