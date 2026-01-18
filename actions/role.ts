'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { auth, unstable_update as update } from '@/auth';
import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { userRolesSchema, roleSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function assignRoles(data: z.infer<typeof userRolesSchema>) {
  const result = userRolesSchema.safeParse(data);

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  try {
    const session = await auth();
    const { id, roles } = result.data;

    const [, , updatedRoles] = await prisma.$transaction(
      async function (transaction) {
        return await Promise.all([
          transaction.userRole.deleteMany({ where: { userId: id } }),
          transaction.userRole.createMany({
            data: roles.map(roleId => ({ roleId, userId: id }))
          }),
          transaction.userRole.findMany({
            select: { id: true, role: true },
            where: { userId: id }
          })
        ]);
      }
    );

    if (session?.user?.id === id) {
      await update({
        user: { ...session.user, roles: updatedRoles.map(r => r.role) }
      });
    }

    return { message: MESSAGES.ROLE.ASSIGNED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addRole(data: z.infer<typeof roleSchema>) {
  const result = roleSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.role.create({
      data: { name: result.data.name }
    });

    return { ...data, message: MESSAGES.ROLE.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateRole(id: string, data: z.infer<typeof roleSchema>) {
  const result = roleSchema.safeParse(data);

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  try {
    await prisma.role.update({ data: { ...result.data }, where: { id } });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.ROLE.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
