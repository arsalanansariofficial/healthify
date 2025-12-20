import { User } from 'next-auth';
import { redirect } from 'next/navigation';

import Component from '@/app/(private)/appointments/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import { ROUTES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { getDate, hasRole } from '@/lib/utils';

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect(ROUTES.LOGIN);

  let appointments = await prisma.appointment.findMany({
    include: { doctor: true, patient: true, timeSlot: true },
    orderBy: { date: 'desc' },
    where: {
      OR: [{ patientId: session.user.id }, { doctorId: session.user.id }]
    }
  });

  if (hasRole(session.user.roles, ROLES.ADMIN as string)) {
    appointments = await prisma.appointment.findMany({
      include: { doctor: true, patient: true, timeSlot: true },
      orderBy: { date: 'desc' }
    });
  }

  return (
    <Component
      user={session?.user as User}
      key={appointments.map(s => s.updatedAt).toString()}
      appointments={appointments.map(apt => ({
        ...apt,
        date: getDate(apt.date.toString()),
        doctor: apt.doctor.name as string,
        patient: apt.name,
        time: apt.timeSlot.time
      }))}
    />
  );
}
