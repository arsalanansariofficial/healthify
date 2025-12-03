'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { nameSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function deleteSpeciality(id: string) {
  await prisma.speciality.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteSpecialities(ids: string[]) {
  await prisma.speciality.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function updateSpeciality(
  id: string,
  { name }: z.infer<typeof nameSchema>
) {
  const result = nameSchema.safeParse({ name });
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.speciality.update({ data: { name }, where: { id } });

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.SPECIALITY.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addSpeciality({ name }: z.infer<typeof nameSchema>) {
  const result = nameSchema.safeParse({ name });
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.speciality.create({
      data: { name: result.data.name as string }
    });

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.SPECIALITY.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
