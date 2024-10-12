import { PrismaClient } from '@prisma/client';

import Component from '@/app/roles/assign-permissions/component';

const prisma = new PrismaClient();

type Props = { searchParams: Promise<{ role: string }> };

export default async function Page({ searchParams }: Props) {
  let assigned, permissions;
  const { role } = await searchParams;

  if (role) {
    permissions = await prisma.permission.findMany();
    assigned = await prisma.role.findUnique({
      where: { name: role },
      select: { permissions: true }
    });
  }

  return (
    <Component
      key={role}
      permissions={permissions}
      assigned={assigned?.permissions}
      roles={await prisma.role.findMany()}
    />
  );
}
