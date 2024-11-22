import { PrismaClient } from '@prisma/client';

import Component from '@/app/specialities/component';

const prisma = new PrismaClient();

export default async function Page() {
  const specialities = await prisma.speciality.findMany();
  return <Component key={specialities.length} specialities={specialities} />;
}
