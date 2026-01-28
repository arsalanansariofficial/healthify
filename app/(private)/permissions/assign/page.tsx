import { RolePermission } from '@prisma/client';
import { User } from 'next-auth';

import Component from '@/app/(private)/permissions/assign/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ role: string }>;
}) {
  const session = await auth();
  const { role } = await searchParams;

  const { permissions, rolePermissions, roles } = await prisma.$transaction(
    async transaction => {
      const [roles, permissions] = await Promise.all([
        transaction.role.findMany(),
        transaction.permission.findMany()
      ]);

      let existingRole = null;
      let rolePermissions: RolePermission[] = [];

      if (role)
        existingRole = await transaction.role.findUnique({
          where: { name: role }
        });

      if (existingRole)
        rolePermissions = await transaction.rolePermission.findMany({
          where: { roleId: existingRole.id }
        });

      return { permissions, rolePermissions, roles };
    }
  );

  return (
    <Component
      assigned={rolePermissions.map(p => p.permissionId) || []}
      key={role}
      permissions={permissions.map(p => ({ label: p.name, value: p.id }))}
      role={role}
      roles={roles}
      user={session?.user as User}
    />
  );
}
