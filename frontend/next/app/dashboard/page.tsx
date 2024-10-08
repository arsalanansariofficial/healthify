import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

import { auth } from '@/auth';
import Component from '@/app/dashboard/component';

const prisma = new PrismaClient();

export default async function Page() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { roles: { include: { permissions: true } } }
  });

  if (!user) redirect('/login');
  return <Component user={user} />;
}
