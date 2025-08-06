import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from './component';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';

export default async function Page() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      id: true,
      city: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      gender: true,
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
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          user={user!}
          specialities={(await prisma.speciality.findMany()).map(s => ({
            value: s.id,
            label: s.name
          }))}
        />
      </main>
    </Session>
  );
}
