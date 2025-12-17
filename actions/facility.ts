'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { facilitySchema } from '@/lib/schemas';
import { MESSAGES } from '@/constants/messages';

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
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.facility.create({ data: { ...result.data } });
    return { success: true, message: MESSAGES.FACILITY.ADDED };
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
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.facility.update({ where: { id }, data: { ...result.data } });
    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.FACILITY.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
