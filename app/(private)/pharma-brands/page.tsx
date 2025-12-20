import { notFound } from 'next/navigation';

import Component from '@/app/(private)/pharma-brands/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const brands = await prisma.pharmaBrand.findMany();

  return (
    <Component
      brands={brands}
      key={brands.map(b => b.updatedAt).toString()}
      user={session.user}
    />
  );
}
