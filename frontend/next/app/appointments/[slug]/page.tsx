import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { User } from 'next-auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/appointments/[slug]/component';

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

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component doctor={doctor} user={session?.user as User} />
      </main>
    </Session>
  );
}
