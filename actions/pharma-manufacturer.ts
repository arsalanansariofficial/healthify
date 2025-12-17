'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { pharmaManufacturerSchema } from '@/lib/schemas';

export async function deletePharmaManufacturer(id: string) {
  await prisma.pharmaManufacturer.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deletePharmaManufacturers(ids: string[]) {
  await prisma.pharmaManufacturer.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addPharmaManufacturer(
  data: z.infer<typeof pharmaManufacturerSchema>
) {
  const result = pharmaManufacturerSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaManufacturer.create({ data: { ...result.data } });
    return { success: true, message: MESSAGES.PHARMA_MANUFACTURER.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updatePharmaManufacturer(
  id: string,
  data: z.infer<typeof pharmaManufacturerSchema>
) {
  const result = pharmaManufacturerSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaManufacturer.update({
      where: { id },
      data: { ...result.data }
    });
    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.PHARMA_MANUFACTURER.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
