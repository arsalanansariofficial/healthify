import type { HTTPHeaders } from 'elysia/types';

import { StatusMap } from 'elysia';
import { eq } from 'drizzle-orm';

import type { Payload } from '@/modules/doctor/payload';
import type { Model } from '@/modules/user/model';

import {
  doctorToSpecialization,
  schedule,
  doctor,
  user
} from '@/lib/db/schema';
import { type Transaction, db } from '@/lib/db';
import { Role } from '@/modules/user/types';
import { session } from '@/lib/session';
import { ApiError } from '@/lib/error';

async function register(args: {
  set: { headers: HTTPHeaders };
  payload: Payload['register'];
  user: Model['user'];
  headers: Headers;
}) {
  db.transaction(transaction => {
    transaction
      .update(user)
      .set({ role: Role.doctor })
      .where(eq(user.id, args.user.id))
      .run();

    transaction
      .insert(doctor)
      .values({
        ...args.payload.doctor,
        userId: args.payload.doctor.userId || args.user.id
      })
      .onConflictDoUpdate({ set: args.payload.doctor, target: doctor.userId })
      .run();

    checkSpecializations({
      specializations: args.payload.specializations,
      transaction
    });

    db.delete(doctorToSpecialization)
      .where(eq(doctorToSpecialization.doctorId, args.user.id))
      .run();

    db.delete(schedule).where(eq(schedule.doctorId, args.user.id)).run();

    args.payload.specializations.forEach(specialization =>
      transaction
        .insert(doctorToSpecialization)
        .values({ doctorId: args.user.id, specialization })
        .run()
    );

    args.payload.schedule.forEach($schedule => {
      transaction
        .insert(schedule)
        .values({ doctorId: args.user.id, ...$schedule })
        .run();
    });
  });

  return await updateAndReturn({
    headers: args.headers,
    user: args.user,
    set: args.set
  });
}

async function update(args: {
  set: { headers: HTTPHeaders };
  payload: Payload['register'];
  user: Model['user'];
  headers: Headers;
}) {
  db.transaction(transaction => {
    checkSpecializations({
      specializations: args.payload.specializations,
      transaction
    });

    transaction
      .delete(doctorToSpecialization)
      .where(eq(doctorToSpecialization.doctorId, args.user.id))
      .run();

    transaction
      .delete(schedule)
      .where(eq(schedule.doctorId, args.user.id))
      .run();

    args.payload.specializations.forEach(specialization =>
      transaction
        .insert(doctorToSpecialization)
        .values({ doctorId: args.user.id, specialization })
        .run()
    );

    args.payload.schedule.forEach($schedule => {
      transaction
        .insert(schedule)
        .values({ doctorId: args.user.id, ...$schedule })
        .run();
    });
  });

  return await updateAndReturn({
    headers: args.headers,
    user: args.user,
    set: args.set
  });
}

function checkSpecializations(args: {
  specializations: string[];
  transaction: Transaction;
}) {
  const $specializations = args.transaction.query.specialization
    .findMany({ where: { name: { in: args.specializations } } })
    .sync();

  if ($specializations.length !== args.specializations.length)
    throw new ApiError(
      [
        {
          message: 'One of the speciailizations are invalid.',
          path: args.specializations
        }
      ],
      'Invalid specialization.',
      StatusMap['Bad Request']
    );
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
      .run();

    transaction.delete(doctor).where(eq(doctor.userId, args.user.id)).run();
  });

  return updateAndReturn({
    headers: args.headers,
    user: args.user,
    set: args.set
  });
}

async function updateAndReturn(args: {
  set: { headers: HTTPHeaders };
  user: Model['user'];
  headers: Headers;
}) {
  const updated = await db.query.user.findFirst({
    with: {
      doctor: { with: { specializations: true, schedules: true } },
      profile: true
    },
    where: { id: args.user.id }
  });

  if (!updated) throw new ApiError();

  await session.update({ headers: args.headers, set: args.set });
  return updated;
}

export const doctorService = { deRegister, register, update } as const;
