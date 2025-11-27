'use server';

import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import prisma from '@/lib/prisma';
import { appointmentSummarySchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

import { removeFile, saveFile } from './file';

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
