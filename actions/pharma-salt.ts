'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { pharmaSaltSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaSalt.create({ data: { ...result.data } });
    return { message: MESSAGES.PHARMA_SALT.ADDED, success: true };
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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.pharmaSalt.update({ data: { ...result.data }, where: { id } });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.PHARMA_SALT.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
