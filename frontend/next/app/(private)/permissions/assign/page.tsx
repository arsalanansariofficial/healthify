import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { DEFAULT_ROLE } from '@/lib/constants';
import Component from '@/app/(private)/permissions/assign/component';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ role: string }>;
}) {
  const session = await auth();
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
      user={session?.user as User}
      assigned={rolePermissions.map(p => p.permissionId) || []}
      permissions={permissions.map(p => ({ label: p.name, value: p.id }))}
    />
  );
}
