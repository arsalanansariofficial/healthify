import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ROLES } from '@/lib/constants';
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
