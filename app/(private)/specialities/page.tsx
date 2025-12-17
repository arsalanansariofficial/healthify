import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ROLES } from '@/lib/constants';
import Component from '@/app/(private)/specialities/component';

export default async function Page() {
  const [session, specialities, doctors] = await Promise.all([
    auth(),
    prisma.speciality.findMany(),
    prisma.userRole.findMany({
      where: { role: { name: ROLES.DOCTOR as string } },
      select: {
        user: {
          include: {
            timings: true,
            UserSpecialities: {
              select: { speciality: { select: { name: true } } }
            }
          }
        }
      }
    })
  ]);

  return (
    <Component
      specialities={specialities}
      user={session?.user as User}
      doctors={doctors.map(d => d.user)}
      key={specialities.map(s => s.updatedAt).toString()}
    />
  );
}
