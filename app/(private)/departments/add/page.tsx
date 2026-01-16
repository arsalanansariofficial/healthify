import { notFound } from 'next/navigation';

import Component from '@/app/(private)/departments/add/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  const [facilities, hospitals] = await Promise.all([
    prisma.facility.findMany({ select: { id: true, name: true } }),
    prisma.hospital.findMany({ select: { id: true, name: true } })
  ]);

  return <Component facilities={facilities} hospitals={hospitals} />;
}
