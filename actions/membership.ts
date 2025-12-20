'use server';

import {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus
} from '@prisma/client';
import { addDays } from 'date-fns';
import { revalidatePath } from 'next/cache';
import z from 'zod';

import { DATES } from '@/constants/date';
import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';
import { membershipSchema, membershipSubscriptionSchema } from '@/lib/schemas';
import { catchErrors } from '@/lib/utils';

export async function addMembership(data: z.infer<typeof membershipSchema>) {
  const result = membershipSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.membership.create({
      data: {
        ...result.data,
        fees: { create: result.data.fees },
        hospitalMemberships: {
          create: result.data.hospitalMemberships.map(hm => ({
            hospital: {
              create: {
                ...hm,
                doctors: { connect: hm.doctors.map(d => ({ id: d })) },
                isAffiliated: hm.isAffiliated === 'yes' ? true : false
              }
            }
          }))
        }
      }
    });

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.MEMBERSHIP.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function subscribeMembership(
  data: z.infer<typeof membershipSubscriptionSchema>
) {
  const result = membershipSubscriptionSchema.safeParse(data);
  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  try {
    await prisma.membershipSubscription.createMany({
      data: result.data.users.map(u => ({
        feeId: result.data.feeId,
        membershipId: result.data.membershipId,
        userId: u
      }))
    });

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.MEMBERSHIP_SUBSCRIPTION.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function payForMembership(id: string) {
  try {
    const subscription = await prisma.membershipSubscription.findUnique({
      select: { fee: { select: { amount: true, renewalType: true } } },
      where: { id }
    });

    if (!subscription)
      return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

    let expiresAt;

    if (subscription.fee.renewalType === 'monthly') {
      expiresAt = addDays(new Date(), DATES.DAYS_IN_MONTH as number);
    }

    if (subscription.fee.renewalType === 'yearly') {
      expiresAt = addDays(new Date(), DATES.DAYS_IN_YEAR as number);
    }

    await prisma.membershipSubscription.update({
      data: {
        status: SubscriptionStatus.active,
        transactions: {
          create: {
            amount: subscription.fee.amount as number,
            expiresAt,
            method: PaymentMethod.cash,
            status: PaymentStatus.completed
          }
        }
      },
      select: { fee: { select: { renewalType: true } }, updatedAt: true },
      where: { id }
    });

    revalidatePath(ROUTES.HOME);
    return { message: MESSAGES.MEMBERSHIP_SUBSCRIPTION.ADDED, success: true };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
