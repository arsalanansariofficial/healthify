import { User } from 'next-auth';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from './component';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { getDate, hasRole } from '@/lib/utils';
import { ADMIN_ROLE, LOGIN } from '@/lib/constants';

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect(LOGIN);

  let appointments = await prisma.appointment.findMany({
    orderBy: { date: 'desc' },
    include: { timeSlot: true, patient: true, doctor: true }
  });

  if (hasRole(session.user.roles, ADMIN_ROLE)) {
    appointments = await prisma.appointment.findMany({
      orderBy: { date: 'desc' },
      include: { timeSlot: true, patient: true, doctor: true },
      where: {
        OR: [{ patientId: session.user.id }, { doctorId: session.user.id }]
      }
    });
  }

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          user={session?.user as User}
          key={appointments.map(s => s.updatedAt).toString()}
          appointments={appointments.map(apt => ({
            ...apt,
            patient: apt.name,
            time: apt.timeSlot.time,
            doctor: apt.doctor.name as string,
            date: getDate(apt.date.toString())
          }))}
        />
      </main>
    </Session>
  );
}
