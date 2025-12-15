import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/account/component';

export default async function Page() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      id: true,
      bio: true,
      city: true,
      name: true,
      email: true,
      image: true,
      cover: true,
      phone: true,
      gender: true,
      hasOAuth: true,
      createdAt: true,
      updatedAt: true,
      experience: true,
      daysOfVisit: true,
      emailVerified: true,
      timings: { select: { id: true, time: true, duration: true } },
      UserRoles: { select: { role: { select: { id: true, name: true } } } },
      UserSpecialities: {
        select: { speciality: { select: { id: true, name: true } } }
      }
    }
  });

  return (
    <Component
      user={user!}
      specialities={(await prisma.speciality.findMany()).map(s => ({
        value: s.id,
        label: s.name
      }))}
    />
  );
}
