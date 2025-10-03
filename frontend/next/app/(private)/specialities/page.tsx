import { User } from 'next-auth';

import Component from '@/app/(private)/specialities/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';

export default async function Page() {
  const [session, specialities, doctors] = await Promise.all([
    auth(),
    prisma.speciality.findMany(),
    prisma.userRole.findMany({
      select: {
        user: {
          include: {
            timings: true,
            UserSpecialities: {
              select: { speciality: { select: { name: true } } }
            }
          }
        }
      },
      where: { role: { name: ROLES.DOCTOR as string } }
    })
  ]);

  return (
    <Component
      doctors={doctors.map(d => d.user)}
      key={specialities.map(s => s.updatedAt).toString()}
      specialities={specialities}
      user={session?.user as User}
    />
  );
}
