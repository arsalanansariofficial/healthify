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

  const appointment = await prisma.appointment.findUnique({
    include: { doctor: true, timeSlot: true },
    where: { id: slug }
  });

  if (!appointment) redirect('/not-found');

  return <Component appointment={appointment} user={session?.user as User} />;
}
