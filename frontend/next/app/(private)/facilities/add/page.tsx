import { notFound } from 'next/navigation';

import Component from '@/app/(private)/facilities/add/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  return (
    <Component
      departments={await prisma.department.findMany({
        select: { id: true, name: true }
      })}
    />
  );
}
