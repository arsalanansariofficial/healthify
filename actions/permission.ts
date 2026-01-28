'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { auth, unstable_update as update } from '@/auth';
import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { rolePermissionsSchema, permissionSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function assignPermissions({
  name,
  permissions
}: z.infer<typeof rolePermissionsSchema>) {
  const result = rolePermissionsSchema.safeParse({ name, permissions });

  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    const session = await auth();

    await prisma.$transaction(async transaction => {
      const role = await transaction.role.findUnique({ where: { name } });
      if (!role) return { permits: [], roles: [] };

      const deletePermissions = transaction.rolePermission.deleteMany({
        where: { roleId: role.id }
      });

      const addPermissions = transaction.rolePermission.createMany({
        data: permissions.map(p => ({ permissionId: p, roleId: role.id }))
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
    return { message: MESSAGES.PERMISSION.ASSIGNED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addPermission(data: z.infer<typeof permissionSchema>) {
  const result = permissionSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.permission.create({ data: { name: result.data.name } });

    return { ...data, message: MESSAGES.PERMISSION.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updatePermission(
  id: string,
  data: z.infer<typeof permissionSchema>
) {
  const result = permissionSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.permission.update({ data: { ...result.data }, where: { id } });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.PERMISSION.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
