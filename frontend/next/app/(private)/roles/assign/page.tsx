import Component from '@/app/(private)/roles/assign/component';
import prisma from '@/lib/prisma';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ userId: string }>;
}) {
  const [users, roles, { userId }] = await Promise.all([
    prisma.user.findMany({
      select: {
        email: true,
        id: true,
        name: true,
        UserRoles: {
          select: { id: true, role: { select: { id: true, name: true } } }
        }
      }
    }),
    prisma.role.findMany(),
    searchParams
  ]);

  return <Component key={userId} roles={roles} userId={userId} users={users} />;
}
