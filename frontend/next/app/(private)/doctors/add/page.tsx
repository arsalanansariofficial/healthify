import { User } from 'next-auth';

import Component from '@/app/(private)/doctors/add/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();

  return (
    <Component
      user={session?.user as User}
      specialities={(await prisma.speciality.findMany()).map(s => ({
        label: s.name,
        value: s.id
      }))}
    />
  );
}
