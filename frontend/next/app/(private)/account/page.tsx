import Component from '@/app/(private)/account/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    select: {
      bio: true,
      city: true,
      cover: true,
      createdAt: true,
      daysOfVisit: true,
      email: true,
      emailVerified: true,
      experience: true,
      gender: true,
      hasOAuth: true,
      id: true,
      image: true,
      name: true,
      phone: true,
      timings: { select: { duration: true, id: true, time: true } },
      updatedAt: true,
      UserRoles: { select: { role: { select: { id: true, name: true } } } },
      UserSpecialities: {
        select: { speciality: { select: { id: true, name: true } } }
      }
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
