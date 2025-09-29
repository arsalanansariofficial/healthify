'use server';

import z from 'zod';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { hospitalSchema } from '@/lib/schemas';
import { MESSAGES } from '@/constants/messages';

export async function deleteHospital(id: string) {
  await prisma.hospital.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteHospitals(ids: string[]) {
  await prisma.hospital.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addHospital(data: z.infer<typeof hospitalSchema>) {
  const result = hospitalSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.hospital.create({
      data: {
        ...result.data,
        isAffiliated: result.data.isAffiliated === 'yes',
        doctors: { connect: result.data.doctors.map(d => ({ id: d })) }
      }
    });

    return { success: true, message: MESSAGES.HOSPITAL.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function updateHospital(
  id: string,
  data: z.infer<typeof hospitalSchema>
) {
  const result = hospitalSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.hospital.update({
      where: { id },
      data: {
        ...result.data,
        isAffiliated: result.data.isAffiliated === 'yes',
        doctors: { set: [], connect: result.data.doctors.map(d => ({ id: d })) }
      }
    });

    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.HOSPITAL.UPDATED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
