import { User } from 'next-auth';
import { redirect } from 'next/navigation';

import Component from '@/app/(private)/appointments/[slug]/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  if (!slug) redirect('/not-found');

  const [appointment, hospitals, facilities] = await Promise.all([
    prisma.appointment.findUnique({
      include: {
        appointmentHospitals: true,
        benificiary: true,
        doctor: true,
        facilities: true,
        patient: true,
        prescriptions: true,
        timeSlot: true
      },
      where: { id: slug }
    }),
    prisma.hospital.findMany(),
    prisma.facility.findMany()
  ]);

  if (!appointment) redirect('/not-found');

  return (
    <Component
      appointment={appointment}
      facilities={facilities}
      hospitals={hospitals}
      user={session?.user as User}
    />
  );
}
