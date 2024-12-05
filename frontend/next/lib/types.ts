import { Prisma } from '@prisma/client';

export type DoctorProps = { specialities: { value: string; label: string }[] };

export type User = Prisma.UserGetPayload<{
  include: { roles: { include: { permissions: true } } };
}>;
