import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { User } from 'next-auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/appointments/[slug]/component';

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const session = await auth();
  const { slug } = await params;

  if (!slug) notFound();

  const doctor = await prisma.user.findUnique({
    where: { id: slug },
    include: { timings: true }
  });

  if (!doctor) notFound();

  return <Component doctor={doctor} user={session?.user as User} />;
}
