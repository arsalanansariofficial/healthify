'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { facilitySchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function deleteFacility(id: string) {
  await prisma.facility.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteFacilities(ids: string[]) {
  await prisma.facility.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addFacility(data: z.infer<typeof facilitySchema>) {
  const result = facilitySchema.safeParse(data);

  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  const { departments, name } = result.data;

  try {
    await prisma.facility.create({
      data: {
        departmentFacilities: {
          create: departments.map(v => ({ departmentId: v }))
        },
        name
      }
    });
    return { message: MESSAGES.FACILITY.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateFacility(
  id: string,
  data: z.infer<typeof facilitySchema>
) {
  const result = facilitySchema.safeParse(data);

  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.facility.update({ data: { ...result.data }, where: { id } });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.FACILITY.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
