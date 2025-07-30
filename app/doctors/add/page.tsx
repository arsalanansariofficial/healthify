import prisma from '@/lib/prisma';
import Component from '@/app/doctors/add/component';

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
