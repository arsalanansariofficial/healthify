import type { HTTPHeaders } from 'elysia/types';

import { eq } from 'drizzle-orm';

import type { Payload } from '@/modules/doctor/payload';
import type { Model } from '@/modules/user/model';

import { userService } from '@/modules/user/service';
import { doctor, user } from '@/lib/db/schema';
import { Role } from '@/modules/user/types';
import { db } from '@/lib/db';

async function register(args: {
  set: { headers: HTTPHeaders };
  payload: Payload['doctor'];
  user: Model['user'];
  headers: Headers;
}) {
  db.transaction(transaction => {
    transaction
      .update(user)
      .set({ role: Role.doctor })
      .where(eq(user.id, args.user.id))
      .execute();

    transaction
      .insert(doctor)
      .values({ ...args.payload, userId: args.user.id })
      .onConflictDoUpdate({ target: doctor.userId, set: args.payload })
      .execute();
  });

  return userService.update({
    headers: args.headers,
    user: args.user,
    set: args.set,
    payload: {}
  });
}

async function deRegister(args: {
  set: { headers: HTTPHeaders };
  user: Model['user'];
  headers: Headers;
}) {
  db.transaction(transaction => {
    transaction
      .update(user)
      .set({ role: Role.user })
      .where(eq(user.id, args.user.id))
      .execute();

    transaction.delete(doctor).where(eq(doctor.userId, args.user.id)).execute();
  });

  return userService.update({
    headers: args.headers,
    user: args.user,
    set: args.set,
    payload: {}
  });
}

export const doctorService = { deRegister, register } as const;
