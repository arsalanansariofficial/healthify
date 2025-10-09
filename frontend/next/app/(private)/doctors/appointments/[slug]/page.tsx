import { User } from 'next-auth';
import { notFound } from 'next/navigation';

import Component from '@/app/(private)/doctors/appointments/[slug]/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  if (!slug) notFound();

  const doctor = await prisma.user.findUnique({
    include: { timings: true },
    where: { id: slug }
  });

  if (!doctor) notFound();

  return <Component doctor={doctor} user={session?.user as User} />;
}
