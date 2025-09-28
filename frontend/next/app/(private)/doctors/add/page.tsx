import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/doctors/add/component';

export default async function Page() {
  const session = await auth();

  return (
    <Component
      user={session?.user as User}
      specialities={(await prisma.speciality.findMany()).map(s => ({
        value: s.id,
        label: s.name
      }))}
    />
  );
}
