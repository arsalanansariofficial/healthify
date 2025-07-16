import { User } from 'next-auth';
import { PrismaClient } from '@prisma/client';

import { auth } from '@/auth';
import Component from '@/app/doctors/component';

const prisma = new PrismaClient();

export default async function Page() {
  const session = await auth();
  const specialities = await prisma.speciality.findMany();
  return <Component user={session?.user as User} specialities={specialities} />;
}
