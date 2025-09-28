import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/pharma-codes/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const codes = await prisma.pharmaCode.findMany();

  return (
    <Component
      codes={codes}
      user={session.user}
      key={codes.map(c => c.updatedAt).toString()}
    />
  );
}
