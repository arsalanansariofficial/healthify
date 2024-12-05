import { PrismaClient } from '@prisma/client';

import Component from '@/app/doctors/add/component';

const prisma = new PrismaClient();

export default async function Page() {
  return (
    <Component
      specialities={(await prisma.speciality.findMany()).map(s => ({
        value: s.id,
        label: s.name
      }))}
    />
  );
}
