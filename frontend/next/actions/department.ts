'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { departmentSchema } from '@/lib/schemas';

export async function deleteDepartment(id: string) {
  await prisma.department.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteDepartments(ids: string[]) {
  await prisma.department.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addDepartment(data: z.infer<typeof departmentSchema>) {
  const result = departmentSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.department.create({ data: { ...result.data } });
    return { success: true, message: MESSAGES.DEPARTMENT.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateDepartment(
  id: string,
  data: z.infer<typeof departmentSchema>
) {
  const result = departmentSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.department.update({ where: { id }, data: { ...result.data } });
    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.DEPARTMENT.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
