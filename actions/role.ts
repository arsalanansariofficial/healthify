'use server';

import z from 'zod';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { MESSAGES } from '@/constants/messages';
import { auth, unstable_update as update } from '@/auth';
import { userRolesSchema, roleSchema } from '@/lib/schemas';

export async function assignRoles(
  id: string,
  data: z.infer<typeof userRolesSchema>
) {
  const result = userRolesSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    const session = await auth();

    const [, , roles] = await prisma.$transaction(async function (transaction) {
      return await Promise.all([
        transaction.userRole.deleteMany({ where: { userId: id } }),
        transaction.userRole.createMany({
          data: data.roles.map(roleId => ({ roleId, userId: id }))
        }),
        transaction.userRole.findMany({
          where: { userId: id },
          select: { id: true, role: true }
        })
      ]);
    });

    await update({ user: { ...session?.user, roles: roles.map(r => r.role) } });
    return { success: true, message: MESSAGES.ROLE.ASSIGNED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addRole(data: z.infer<typeof roleSchema>) {
  const result = roleSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.role.create({
      data: { name: result.data.name }
    });

    return { ...data, success: true, message: MESSAGES.ROLE.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
