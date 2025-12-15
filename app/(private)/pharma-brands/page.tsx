import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/pharma-brands/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const brands = await prisma.pharmaBrand.findMany();

  return (
    <Component
      brands={brands}
      user={session.user}
      key={brands.map(b => b.updatedAt).toString()}
    />
  );
}
