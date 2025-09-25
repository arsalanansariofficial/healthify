import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/memberships/[slug]/subscribe/component';
import { DEFAULT_ROLE } from '@/lib/constants';

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session || !session.user) notFound();

  const { slug } = await params;
  if (!slug) notFound();

  const membership = await prisma.membership.findUnique({
    where: { id: slug },
    include: { fees: true }
  });

  if (!membership) notFound();

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    where: { UserRoles: { some: { role: { name: DEFAULT_ROLE } } } }
  });

  if (!users.length) notFound();

  return (
    <Session expiresAt={session.user.expiresAt}>
      <Header user={session.user} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-12">
        <Sidebar user={session.user} />
        <Component users={users} user={session.user} membership={membership} />
      </main>
    </Session>
  );
}
