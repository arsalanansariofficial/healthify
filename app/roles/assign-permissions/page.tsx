import { PrismaClient } from '@prisma/client';

import Component from '@/app/roles/assign-permissions/component';

const prisma = new PrismaClient();

type Props = { searchParams: Promise<{ role: string }> };

export default async function Page({ searchParams }: Props) {
  const { role } = await searchParams;

  const { roles, permissions, existingRole } = await prisma.$transaction(
    async function (transaction) {
      const roles = await transaction.role.findMany();
      const defaultRole = await transaction.role.findFirst();
      const permissions = await transaction.permission.findMany();

      const existingRole = await transaction.role.findUnique({
        include: { permissions: true },
        where: { name: role ? role : defaultRole?.name || 'USER' }
      });

      return { roles, permissions, existingRole };
    }
  );

  return (
    <Component
      key={role}
      role={role}
      roles={roles}
      assigned={existingRole?.permissions.map(p => p.id) || []}
      permissions={permissions.map(p => ({ label: p.name, value: p.id }))}
    />
  );
}
