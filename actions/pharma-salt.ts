'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { pharmaSaltSchema } from '@/lib/schemas';

export async function deletePharmaSalt(id: string) {
  await prisma.pharmaSalt.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deletePharmaSalts(ids: string[]) {
  await prisma.pharmaSalt.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addPharmaSalt(data: z.infer<typeof pharmaSaltSchema>) {
  const result = pharmaSaltSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaSalt.create({ data: { ...result.data } });
    return { success: true, message: MESSAGES.PHARMA_SALT.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updatePharmaSalt(
  id: string,
  data: z.infer<typeof pharmaSaltSchema>
) {
  const result = pharmaSaltSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.pharmaSalt.update({ where: { id }, data: { ...result.data } });
    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.PHARMA_SALT.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
