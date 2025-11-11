import Component from './component';
import { notFound } from 'next/navigation';

import prisma from '@/lib/prisma';

type Props = { params: Promise<{ slug: string }> };

export default async function Page(props: Props) {
  const { slug } = await props.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: slug },
    select: {
      id: true,
      date: true,
      city: true,
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

  if (!appointment) notFound();
  return <Component appointment={appointment} />;
}
