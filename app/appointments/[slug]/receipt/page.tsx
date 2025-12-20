import { AppointmentStatus } from '@prisma/client';
import { notFound } from 'next/navigation';

import Component from '@/app/appointments/[slug]/receipt/component';
import prisma from '@/lib/prisma';

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const appointment = await prisma.appointment.findUnique({
    select: {
      city: true,
      date: true,
      doctor: {
        select: {
          name: true,
          phone: true,
          UserSpecialities: {
            select: { speciality: { select: { name: true } } }
          }
        }
      },
      id: true,
      patient: { select: { name: true } },
      status: true,
      timeSlot: { select: { time: true } }
    },
    where: { id: slug }
  });

  if (!appointment || appointment.status !== AppointmentStatus.confirmed) {
    notFound();
  }

  return <Component appointment={appointment} />;
}
