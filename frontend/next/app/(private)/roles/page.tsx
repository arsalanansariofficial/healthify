import { notFound } from 'next/navigation';

import Component from '@/app/(private)/roles/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const roles = await prisma.role.findMany();

  return (
    <Component
      key={roles.map(c => c.updatedAt).toString()}
      roles={roles}
      user={session.user}
    />
  );
}
