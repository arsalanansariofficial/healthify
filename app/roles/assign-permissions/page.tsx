import prisma from '@/lib/prisma';
import { DEFAULT_ROLE } from '@/lib/constants';
import Component from '@/app/roles/assign-permissions/component';

type Props = { searchParams: Promise<{ role: string }> };

export default async function Page({ searchParams }: Props) {
  const { role } = await searchParams;

  const { roles, permissions, rolePermissions } = await prisma.$transaction(
    async function (transaction) {
      const roles = await transaction.role.findMany();
      const defaultRole = await transaction.role.findFirst();
      const permissions = await transaction.permission.findMany();

      const existingRole = await transaction.role.findUnique({
        where: { name: role ? role : defaultRole?.name || DEFAULT_ROLE }
      });

      const rolePermissions = await transaction.rolePermission.findMany({
        where: { roleId: existingRole?.id }
      });

      return { roles, permissions, existingRole, rolePermissions };
    }
  );

  return (
    <Component
      key={role}
      role={role}
      roles={roles}
      assigned={rolePermissions.map(p => p.permissionId) || []}
      permissions={permissions.map(p => ({ label: p.name, value: p.id }))}
    />
  );
}
