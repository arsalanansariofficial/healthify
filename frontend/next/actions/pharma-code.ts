'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { pharmaCodeSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaCode.create({ data: { ...result.data } });
    return { message: MESSAGES.PHARMA_CODE.ADDED, success: true };
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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaCode.update({ data: { ...result.data }, where: { id } });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.PHARMA_CODE.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
