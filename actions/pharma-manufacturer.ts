'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { pharmaManufacturerSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaManufacturer.create({ data: { ...result.data } });
    return { message: MESSAGES.PHARMA_MANUFACTURER.ADDED, success: true };
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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaManufacturer.update({
      data: { ...result.data },
      where: { id }
    });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.PHARMA_MANUFACTURER.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
