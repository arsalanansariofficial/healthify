import { notFound } from 'next/navigation';

import prisma from '@/lib/prisma';
import Component from '@/app/appointments/[slug]/component';

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const doctor = await prisma.user.findUnique({
    where: { id: slug },
    include: { timings: true }
  });

  if (!doctor) notFound();

  return <Component doctor={doctor} />;
}
