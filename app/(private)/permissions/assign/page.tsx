import { User } from 'next-auth';

import Component from '@/app/(private)/permissions/assign/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ role: string }>;
}) {
  const session = await auth();
  const { role } = await searchParams;

  const { permissions, rolePermissions, roles } = await prisma.$transaction(
    async function (transaction) {
      const [roles, defaultRole, permissions] = await Promise.all([
        transaction.role.findMany(),
        transaction.role.findFirst(),
        transaction.permission.findMany()
      ]);

      const existingRole = await transaction.role.findUnique({
        where: {
          name: role ? role : defaultRole?.name || (ROLES.DOCTOR as string)
        }
      });

      const rolePermissions = await transaction.rolePermission.findMany({
        where: { roleId: existingRole?.id }
      });

      return { existingRole, permissions, rolePermissions, roles };
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
