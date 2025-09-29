'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { pharmaBrandSchema } from '@/lib/schemas';

export async function deletePharmaBrand(id: string) {
  await prisma.pharmaBrand.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deletePharmaBrands(ids: string[]) {
  await prisma.pharmaBrand.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addPharmaBrand(data: z.infer<typeof pharmaBrandSchema>) {
  const result = pharmaBrandSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaBrand.create({ data: { ...result.data } });
    return { success: true, message: MESSAGES.PHARMA_BRAND.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updatePharmaBrand(
  id: string,
  data: z.infer<typeof pharmaBrandSchema>
) {
  const result = pharmaBrandSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaBrand.update({
      where: { id },
      data: { ...result.data }
    });
    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.PHARMA_BRAND.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
