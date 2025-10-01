'use server';

import z from 'zod';

import { auth, unstable_update as update } from '@/auth';
import { MESSAGES } from '@/constants/messages';
import prisma from '@/lib/prisma';
import { userRolesSchema, roleSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function assignRoles(
  id: string,
  data: z.infer<typeof userRolesSchema>
) {
  const result = userRolesSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    const session = await auth();

    const [, , roles] = await prisma.$transaction(async function (transaction) {
      return await Promise.all([
        transaction.userRole.deleteMany({ where: { userId: id } }),
        transaction.userRole.createMany({
          data: data.roles.map(roleId => ({ roleId, userId: id }))
        }),
        transaction.userRole.findMany({
          select: { id: true, role: true },
          where: { userId: id }
        })
      ]);
    });

    await update({ user: { ...session?.user, roles: roles.map(r => r.role) } });
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
