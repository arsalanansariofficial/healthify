import { notFound } from 'next/navigation';

import Component from '@/app/(private)/pharma-manufacturers/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

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
