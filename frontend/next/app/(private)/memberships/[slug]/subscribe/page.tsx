import { notFound } from 'next/navigation';

import Component from '@/app/(private)/memberships/[slug]/subscribe/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session || !session.user) notFound();

  const { slug } = await params;
  if (!slug) notFound();

  const membership = await prisma.membership.findUnique({
    include: { fees: true },
    where: { id: slug }
  });

  if (!membership) notFound();

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    where: { UserRoles: { some: { role: { name: ROLES.USER as string } } } }
  });

  if (!users.length) notFound();

  return (
    <Component membership={membership} user={session.user} users={users} />
  );
}
