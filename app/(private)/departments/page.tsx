import { notFound } from 'next/navigation';

import Component from '@/app/(private)/departments/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const departments = await prisma.department.findMany();

  return (
    <Component
      departments={departments}
      key={departments.map(d => d.updatedAt).toString()}
      user={session.user}
    />
  );
}
