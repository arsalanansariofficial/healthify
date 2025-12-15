import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/pharma-manufacturers/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const manufacturers = await prisma.pharmaManufacturer.findMany();

  return (
    <Component
      user={session.user}
      manufacturers={manufacturers}
      key={manufacturers.map(c => c.updatedAt).toString()}
    />
  );
}
