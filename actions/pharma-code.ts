'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { pharmaCodeSchema } from '@/lib/schemas';

export async function deletePharmaCode(id: string) {
  await prisma.pharmaCode.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deletePharmaCodes(ids: string[]) {
  await prisma.pharmaCode.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addPharmaCode(data: z.infer<typeof pharmaCodeSchema>) {
  const result = pharmaCodeSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaCode.create({ data: { ...result.data } });
    return { success: true, message: MESSAGES.PHARMA_CODE.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updatePharmaCode(
  id: string,
  data: z.infer<typeof pharmaCodeSchema>
) {
  const result = pharmaCodeSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaCode.update({ where: { id }, data: { ...result.data } });
    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.PHARMA_CODE.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
