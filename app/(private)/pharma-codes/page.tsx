import { notFound } from 'next/navigation';

import Component from '@/app/(private)/pharma-codes/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const codes = await prisma.pharmaCode.findMany();

  return (
    <Component
      codes={codes}
      key={codes.map(c => c.updatedAt).toString()}
      user={session.user}
    />
  );
}
