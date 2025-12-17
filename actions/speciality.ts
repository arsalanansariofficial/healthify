'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { nameSchema } from '@/lib/schemas';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';

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
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.speciality.update({ where: { id }, data: { name } });

    revalidatePath(ROUTES.HOME);
    return {
      success: true,
      message: MESSAGES.SPECIALITY.ADDED
    };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function addSpeciality({ name }: z.infer<typeof nameSchema>) {
  const result = nameSchema.safeParse({ name });
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.speciality.create({
      data: { name: result.data.name as string }
    });

    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.SPECIALITY.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
