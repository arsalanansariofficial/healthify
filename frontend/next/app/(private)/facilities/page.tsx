import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/facilities/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const facilities = await prisma.facility.findMany();

  return (
    <Component
      user={session.user}
      facilities={facilities}
      key={facilities.map(f => f.updatedAt).toString()}
    />
  );
}
