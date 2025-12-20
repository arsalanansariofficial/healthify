'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { pharmaBrandSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaBrand.create({ data: { ...result.data } });
    return { message: MESSAGES.PHARMA_BRAND.ADDED, success: true };
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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaBrand.update({
      data: { ...result.data },
      where: { id }
    });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.PHARMA_BRAND.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
