import { User } from 'next-auth';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ROLES } from '@/lib/constants';
import { ROUTES } from '@/lib/constants';
import { getDate, hasRole } from '@/lib/utils';
import Component from '@/app/(private)/appointments/component';

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect(ROUTES.LOGIN);

  let appointments = await prisma.appointment.findMany({
    orderBy: { date: 'desc' },
    include: { timeSlot: true, patient: true, doctor: true },
    where: {
      OR: [{ patientId: session.user.id }, { doctorId: session.user.id }]
    }
  });

  if (hasRole(session.user.roles, ROLES.ADMIN as string)) {
    appointments = await prisma.appointment.findMany({
      orderBy: { date: 'desc' },
      include: { timeSlot: true, patient: true, doctor: true }
    });
  }

  return (
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
  );
}
