'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';

import { removeFile, saveFile } from '@/actions/file';
import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { appointmentSummarySchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteAppointments(ids: string[]) {
  await prisma.appointment.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function updateAppointment(
  id: string,
  data: z.infer<typeof appointmentSummarySchema>
) {
  const result = appointmentSummarySchema.safeParse(data);

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  const {
    city,
    date,
    doctorId,
    email,
    isReferred,
    name,
    notes,
    patientId,
    phone,
    reports,
    status,
    timeSlotId
  } = result.data;

  try {
    await prisma.$transaction(async function (transaction) {
      const appointment = await transaction.appointment.findUnique({
        select: { reports: true },
        where: { id }
      });

      if (!appointment) {
        return { message: MESSAGES.SYSTEM.BAD_REQUEST, success: false };
      }

      if (reports.length) {
        await Promise.all([
          ...appointment.reports.map(report => removeFile(report)),
          ...reports.map(report => saveFile(report as File))
        ]);
      }

      await transaction.appointment.update({
        data: {
          city,
          date,
          doctorId,
          email,
          isReferred: isReferred === 'yes',
          name,
          notes,
          patientId,
          phone,
          reports: reports.map(report => (report as File).name),
          status,
          timeSlotId
        },
        where: { id }
      });
    });

    return { message: MESSAGES.APPOINTMENT.CREATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
