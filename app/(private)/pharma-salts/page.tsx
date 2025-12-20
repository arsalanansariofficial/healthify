import { notFound } from 'next/navigation';

import Component from '@/app/(private)/pharma-salts/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const salts = await prisma.pharmaSalt.findMany();

  return (
    <Component
      salts={salts}
      user={session.user}
      key={salts.map(c => c.updatedAt).toString()}
    />
  );
}
