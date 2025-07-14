import { PrismaClient } from '@prisma/client';

import { User } from '@/lib/types';
import { getSessionUser } from '@/lib/actions';
import Component from '@/app/doctors/component';

const prisma = new PrismaClient();

export default async function Page() {
  const { user } = await getSessionUser();
  const specialities = await prisma.speciality.findMany();
  return <Component user={user as User} specialities={specialities} />;
}
