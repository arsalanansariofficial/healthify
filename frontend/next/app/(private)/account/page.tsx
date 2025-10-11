import Component from '@/app/(private)/account/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    include: {
      timings: true,
      UserRoles: { include: { role: true } },
      UserSpecialities: { include: { speciality: true } }
    },
    where: { id: session?.user?.id }
  });

  return (
    <Component
      specialities={(await prisma.speciality.findMany()).map(s => ({
        label: s.name,
        value: s.id
      }))}
      user={user!}
    />
  );
}
