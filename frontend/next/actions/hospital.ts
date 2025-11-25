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

  const {
    doctors,
    hospitalDepartments,
    hospitalMemberships,
    isAffiliated,
    ...rest
  } = result.data;

  try {
    await prisma.$transaction(async function (transaction) {
      await Promise.all([
        transaction.hospitalDepartment.deleteMany({
          where: { hospitalId: id }
        }),
        transaction.hospitalMembership.deleteMany({
          where: { hospitalId: id }
        })
      ]);

      await transaction.hospital.update({
        data: {
          ...rest,
          doctors: { set: doctors.map(d => ({ id: d })) },
          isAffiliated: isAffiliated === 'yes'
        },
        where: { id }
      });

      const prismaCreates = [];

      if (hospitalDepartments.length) {
        prismaCreates.push(
          transaction.hospitalDepartment.createMany({
            data: hospitalDepartments.map(departmentId => ({
              departmentId,
              hospitalId: id
            }))
          })
        );
      }

      if (hospitalMemberships.length) {
        prismaCreates.push(
          transaction.hospitalMembership.createMany({
            data: hospitalMemberships.map(membershipId => ({
              hospitalId: id,
              membershipId
            }))
          })
        );
      }

      await Promise.all(prismaCreates);
    });

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.HOSPITAL.UPDATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
