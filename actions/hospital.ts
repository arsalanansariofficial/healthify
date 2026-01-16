'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { hospitalSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

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

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  try {
    await prisma.hospital.create({
      data: {
        ...result.data,
        doctors: { connect: result.data.doctors.map(d => ({ id: d })) },
        hospitalDepartments: {
          create: result.data.hospitalDepartments.map(d => ({
            department: { connect: { id: d } }
          }))
        },
        hospitalMemberships: {
          create: result.data.hospitalMemberships.map(m => ({
            membership: { connect: { id: m } }
          }))
        },
        isAffiliated: result.data.isAffiliated === 'yes'
      }
    });

    return { message: MESSAGES.HOSPITAL.ADDED, success: true };
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
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.hospital.update({
      data: {
        ...result.data,
        doctors: {
          connect: result.data.doctors.map(d => ({ id: d })),
          set: []
        },
        hospitalDepartments: {
          connect: result.data.hospitalDepartments.map(hd => ({ id: hd })),
          set: []
        },
        hospitalMemberships: {
          connect: result.data.hospitalMemberships.map(hm => ({ id: hm })),
          set: []
        },
        isAffiliated: result.data.isAffiliated === 'yes'
      },
      where: { id }
    });

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.HOSPITAL.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
