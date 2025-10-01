'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { medicationFormSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function deleteMedicationForm(id: string) {
  await prisma.medicationForm.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteMedicationForms(ids: string[]) {
  await prisma.medicationForm.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addMedicationForm(
  data: z.infer<typeof medicationFormSchema>
) {
  const result = medicationFormSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.medicationForm.create({ data: { ...result.data } });
    return { message: MESSAGES.MEDICATION_FROM.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateMedicationForm(
  id: string,
  data: z.infer<typeof medicationFormSchema>
) {
  const result = medicationFormSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.medicationForm.update({
      data: { ...result.data },
      where: { id }
    });
    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.MEDICATION_FROM.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
