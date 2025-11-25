'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/constants/routes';
import prisma from '@/lib/prisma';

export async function deleteSubscription(id: string) {
  await prisma.membershipSubscription.delete({ where: { id } });
  revalidatePath(ROUTES.HOME);
}

export async function deleteSubscriptions(ids: string[]) {
  await prisma.membershipSubscription.deleteMany({
    where: { id: { in: ids } }
  });
  revalidatePath(ROUTES.HOME);
}
