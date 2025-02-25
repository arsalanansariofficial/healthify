import { auth } from '@/auth';
import { User } from 'next-auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { DEFAULT_ROLE } from '@/lib/constants';
import Component from '@/app/roles/assign-permissions/component';

type Props = { searchParams: Promise<{ role: string }> };

export default async function Page({ searchParams }: Props) {
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
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
        <Sidebar user={session?.user as User} />
        <Component
          key={role}
          role={role}
          roles={roles}
          assigned={rolePermissions.map(p => p.permissionId) || []}
          permissions={permissions.map(p => ({ label: p.name, value: p.id }))}
        />
      </main>
    </Session>
  );
}
