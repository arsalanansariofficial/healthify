import { PrismaClient } from '@prisma/client';

import Component from '@/app/roles/assign-permissions/component';

const prisma = new PrismaClient();

type Props = { searchParams: Promise<{ role: string }> };

export default async function Page({ searchParams }: Props) {
  const { role } = await searchParams;
  const defaultRole = await prisma.role.findFirst();

  const existingRole = await prisma.role.findUnique({
    where: { name: role ? role : defaultRole?.name || 'USER' }
  });

  const assigned = await prisma.role.findUnique({
    select: { permissions: true },
    where: {
      name: existingRole ? existingRole.name : defaultRole?.name || 'USER'
    }
  });

  return (
    <Component
      key={role}
      assigned={assigned?.permissions}
      roles={await prisma.role.findMany()}
      permissions={await prisma.permission.findMany()}
    />
  );
}
