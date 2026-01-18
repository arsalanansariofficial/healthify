import { notFound } from 'next/navigation';

import Component from '@/app/(private)/permissions/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const permissions = await prisma.permission.findMany();

  return (
    <Component
      key={permissions.map(c => c.updatedAt).toString()}
      permissions={permissions}
      user={session.user}
    />
  );
}
