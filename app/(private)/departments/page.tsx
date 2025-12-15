import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

import Component from '@/app/(private)/departments/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const departments = await prisma.department.findMany();

  return (
    <Component
      user={session.user}
      departments={departments}
      key={departments.map(d => d.updatedAt).toString()}
    />
  );
}
