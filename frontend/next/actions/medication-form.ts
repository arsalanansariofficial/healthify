'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { medicationFormSchema } from '@/lib/schemas';

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
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.medicationForm.create({ data: { ...result.data } });
    return { success: true, message: MESSAGES.MEDICATION_FROM.ADDED };
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
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.medicationForm.update({
      where: { id },
      data: { ...result.data }
    });
    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.MEDICATION_FROM.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
