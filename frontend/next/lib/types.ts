import { Prisma } from '@prisma/client';

export type User = Prisma.UserGetPayload<{
  include: { roles: { include: { permissions: true } } };
}>;
