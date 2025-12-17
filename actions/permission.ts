'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { auth, unstable_update as update } from '@/auth';
import { rolePermissionsSchema, permissionSchema } from '@/lib/schemas';

export async function assignPermissions({
  name,
  permissions
}: z.infer<typeof rolePermissionsSchema>) {
  const result = rolePermissionsSchema.safeParse({ name, permissions });
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    const session = await auth();

    await prisma.$transaction(async function (transaction) {
      const role = await transaction.role.findUnique({ where: { name } });
      if (!role) return { roles: [], permits: [] };

      const deletePermissions = transaction.rolePermission.deleteMany({
        where: { roleId: role.id }
      });

      const addPermissions = transaction.rolePermission.createMany({
        data: permissions.map(p => ({ roleId: role.id, permissionId: p }))
      });

      if (!permissions.length) return await deletePermissions;
      await Promise.all([deletePermissions, addPermissions]);
    });

    const permits = await prisma.rolePermission.findMany({
      select: { permission: true },
      where: { roleId: { in: session?.user?.roles?.map(r => r.id) } }
    });

    await update({
      user: { ...session?.user, permissions: permits.map(rp => rp.permission) }
    });

    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.PERMISSION.ASSIGNED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addPermission(data: z.infer<typeof permissionSchema>) {
  const result = permissionSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.permission.create({
      data: { name: result.data.name }
    });

    return {
      ...data,
      success: true,
      message: MESSAGES.PERMISSION.ADDED
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
