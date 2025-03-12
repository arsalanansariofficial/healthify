import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/doctors/component';

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
      <Header />
      <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
        <Sidebar user={session?.user as User} />
        <Component
          specialities={specialities}
          user={session?.user as User}
          doctors={doctors.map(d => d.user)}
          key={specialities.map(s => s.updatedAt).toString()}
        />
      </main>
      <Footer />
    </Session>
  );
}
