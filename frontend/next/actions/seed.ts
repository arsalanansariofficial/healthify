'use server';

import bcrypt from 'bcrypt-mini';

import { ADMIN, MESSAGES, PERMISSIONS, ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';

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
            email: ADMIN.EMAIL as string,
            emailVerified: new Date(),
            name: ADMIN.NAME as string,
            password: bcrypt.hashSync(ADMIN.PASSWORD as string, 10)
          }
        })
      ]);

      await Promise.all([
        prisma.userRole.create({
          data: { roleId: role.id, userId: user.id }
        }),
        prisma.rolePermission.create({
          data: { permissionId: permission.id, roleId: role.id }
        })
      ]);
    });

    return { message: MESSAGES.DATABASE.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
