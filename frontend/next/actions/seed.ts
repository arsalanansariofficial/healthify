'use server';

import bcrypt from 'bcrypt-mini';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ADMIN, MESSAGES, PERMISSIONS, ROLES } from '@/lib/constants';

export async function seed() {
  try {
    await prisma.$transaction(async function (transaction) {
      const [role, permission, user] = await Promise.all([
        await transaction.role.create({
          data: { name: ROLES.ADMIN as string }
        }),
        transaction.permission.create({
          data: { name: PERMISSIONS.DEFAULT as string }
        }),
        transaction.user.create({
          data: {
            emailVerified: new Date(),
            name: ADMIN.NAME as string,
            email: ADMIN.EMAIL as string,
            password: bcrypt.hashSync(ADMIN.PASSWORD as string, 10)
          }
        })
      ]);

      await Promise.all([
        prisma.userRole.create({
          data: { userId: user.id, roleId: role.id }
        }),
        prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id }
        })
      ]);
    });

    return { success: true, message: MESSAGES.DATABASE.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
