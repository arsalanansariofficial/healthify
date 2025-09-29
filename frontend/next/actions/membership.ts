'use server';

import z from 'zod';
import { addDays } from 'date-fns';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { DATES } from '@/constants/date';
import { catchErrors } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';
import { membershipSchema, membershipSubscriptionSchema } from '@/lib/schemas';

import {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus
} from '@prisma/client';

export async function addMembership(data: z.infer<typeof membershipSchema>) {
  const result = membershipSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

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
    return { success: true, message: MESSAGES.MEMBERSHIP.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function subscribeMembership(
  data: z.infer<typeof membershipSubscriptionSchema>
) {
  const result = membershipSubscriptionSchema.safeParse(data);
  if (!result.success)
    return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

  try {
    await prisma.membershipSubscription.createMany({
      data: result.data.users.map(u => ({
        userId: u,
        feeId: result.data.feeId,
        membershipId: result.data.membershipId
      }))
    });

    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.MEMBERSHIP_SUBSCRIPTION.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}

export async function payForMembership(id: string) {
  try {
    const subscription = await prisma.membershipSubscription.findUnique({
      where: { id },
      select: { fee: { select: { amount: true, renewalType: true } } }
    });

    if (!subscription)
      return { success: false, message: MESSAGES.SYSTEM.INVALID_INPUTS };

    let expiresAt;

    if (subscription.fee.renewalType === 'monthly') {
      expiresAt = addDays(new Date(), DATES.DAYS_IN_MONTH as number);
    }

    if (subscription.fee.renewalType === 'yearly') {
      expiresAt = addDays(new Date(), DATES.DAYS_IN_YEAR as number);
    }

    await prisma.membershipSubscription.update({
      where: { id },
      select: { fee: { select: { renewalType: true } }, updatedAt: true },
      data: {
        status: SubscriptionStatus.active,
        transactions: {
          create: {
            expiresAt,
            method: PaymentMethod.cash,
            status: PaymentStatus.completed,
            amount: subscription.fee.amount as number
          }
        }
      }
    });

    revalidatePath(ROUTES.HOME);
    return { success: true, message: MESSAGES.MEMBERSHIP_SUBSCRIPTION.ADDED };
  } catch (error) {
    return catchErrors(error as Error);
  }
}
