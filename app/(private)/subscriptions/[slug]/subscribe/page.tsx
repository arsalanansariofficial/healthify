import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ROLES } from '@/lib/constants';
import Component from '@/app/(private)/memberships/[slug]/subscribe/component';

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
    where: { id: slug },
    include: { fees: true }
  });

  if (!membership) notFound();

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    where: { UserRoles: { some: { role: { name: ROLES.USER as string } } } }
  });

  if (!users.length) notFound();

  return (
    <Component users={users} user={session.user} membership={membership} />
  );
}
