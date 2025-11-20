import { notFound } from 'next/navigation';

import Component from '@/app/(private)/departments/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const [departments, facilities, hospitals] = await Promise.all([
    prisma.department.findMany({
      include: { departmentFacilities: true, hospitalDepartments: true }
    }),
    prisma.facility.findMany(),
    prisma.hospital.findMany()
  ]);

  return (
    <Component
      departments={departments}
      facilities={facilities}
      hospitals={hospitals}
      key={departments.map(d => d.updatedAt).toString()}
      user={session.user}
    />
  );
}
