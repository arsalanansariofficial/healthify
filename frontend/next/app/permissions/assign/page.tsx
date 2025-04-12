import { User } from 'next-auth';
import { Suspense } from 'react';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from './component';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { DEFAULT_ROLE } from '@/lib/constants';

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
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Suspense
          fallback={
            <main className="grid h-full place-items-center lg:col-span-2">
              <section className="space-y-4 text-center">
                <p className="animate-pulse font-semibold">Loading...</p>
              </section>
            </main>
          }
        >
          <Component
            key={role}
            role={role}
            roles={roles}
            user={session?.user as User}
            assigned={rolePermissions.map(p => p.permissionId) || []}
            permissions={permissions.map(p => ({ label: p.name, value: p.id }))}
          />
        </Suspense>
      </main>
    </Session>
  );
}
