import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/doctors/component';

export default async function Page() {
  const session = await auth();
  const specialities = await prisma.speciality.findMany();
  return (
    <Component
      specialities={specialities}
      user={session?.user as User}
      key={specialities.map(s => s.updatedAt).toString()}
    />
  );
}
