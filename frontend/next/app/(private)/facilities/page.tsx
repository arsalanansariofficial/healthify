import { notFound } from 'next/navigation';

import Component from '@/app/(private)/facilities/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const [facilities, departments] = await Promise.all([
    prisma.facility.findMany({ include: { departmentFacilities: true } }),
    prisma.department.findMany()
  ]);

  return (
    <Component
      departments={departments}
      facilities={facilities}
      key={facilities.map(f => f.updatedAt).toString()}
      user={session.user}
    />
  );
}
