import { PrismaClient } from '@prisma/client';

import Component from '@/app/doctors/@modal/(.)add/component';

const prisma = new PrismaClient();

export default async function Page() {
  return (
    <Component
      specialities={(await prisma.speciality.findMany()).map(s => ({
        value: s.name,
        label: s.name
      }))}
    />
  );
}
