import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/specialities/component';

export default async function Page() {
  const [session, specialities, doctors] = await Promise.all([
    auth(),
    prisma.speciality.findMany(),
    prisma.userRole.findMany({
      where: { role: { name: 'DOCTOR' } },
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
    <Session expiresAt={session?.user?.expiresAt}>
      <Header user={session?.user as User} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          specialities={specialities}
          user={session?.user as User}
          doctors={doctors.map(d => d.user)}
          key={specialities.map(s => s.updatedAt).toString()}
        />
      </main>
    </Session>
  );
}
