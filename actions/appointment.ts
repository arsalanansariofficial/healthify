'use server';

import z from 'zod';

import { MESSAGES } from '@/constants/messages';
import { appointmentSummarySchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function updateAppointment(
  data: z.infer<typeof appointmentSummarySchema>
) {
  const result = appointmentSummarySchema.safeParse(data);

  if (!result.success) {
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };
  }

  try {
    return { message: MESSAGES.APPOINTMENT.CREATED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
