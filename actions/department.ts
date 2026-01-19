'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { departmentSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

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

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  try {
    await prisma.department.create({ data: { ...result.data } });
    return { message: MESSAGES.DEPARTMENT.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateDepartment(
  id: string,
  data: z.infer<typeof departmentSchema>
) {
  const result = departmentSchema.safeParse(data);

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  try {
    await prisma.department.update({ data: { ...result.data }, where: { id } });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.DEPARTMENT.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
