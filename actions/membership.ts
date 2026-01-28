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

export async function deleteMembership(id: string) {
  await prisma.membership.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteMemberships(ids: string[]) {
  await prisma.membership.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(ROUTES.HOME);
}

export async function addMembership(data: z.infer<typeof membershipSchema>) {
  const result = membershipSchema.safeParse(data);

  if (!result.success)
    return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

  const { name, perks } = result.data;

  try {
    await prisma.membership.create({ data: { name, perks } });

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

  const { feeId, membershipId, users } = result.data;

  try {
    await prisma.membershipSubscription.createMany({
      data: users.map(v => ({
        feeId: feeId || undefined,
        membershipId,
        status: feeId ? SubscriptionStatus.pending : SubscriptionStatus.active,
        userId: v
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

    if (!subscription || !subscription?.fee)
      return { message: MESSAGES.SYSTEM.INVALID_INPUTS, success: false };

    let expiresAt = null;

    if (subscription.fee.renewalType === 'monthly')
      expiresAt = addDays(new Date(), DATES.DAYS_IN_MONTH as number);

    if (subscription.fee.renewalType === 'yearly')
      expiresAt = addDays(new Date(), DATES.DAYS_IN_YEAR as number);

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
