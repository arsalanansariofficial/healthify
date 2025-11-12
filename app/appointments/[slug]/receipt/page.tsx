import { notFound } from 'next/navigation';
import { AppointmentStatus } from '@prisma/client';

import prisma from '@/lib/prisma';
import Component from './component';

type Props = { params: Promise<{ slug: string }> };

export default async function Page(props: Props) {
  const { slug } = await props.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: slug },
    select: {
      id: true,
      date: true,
      city: true,
      status: true,
      patient: { select: { name: true } },
      timeSlot: { select: { time: true } },
      doctor: {
        select: {
          name: true,
          phone: true,
          UserSpecialities: {
            select: { speciality: { select: { name: true } } }
          }
        }
      }
    }
  });

  if (!appointment || appointment.status !== AppointmentStatus.CONFIRMED) {
    notFound();
  }

  return <Component appointment={appointment} />;
}
