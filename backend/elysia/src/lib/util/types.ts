import z from 'zod';

import type { Prisma } from '~/generated/prisma/client';
import type { none } from '@/lib/util';

export type UserWithProfile = Prisma.UserGetPayload<{
  include: { profile: true };
}>;
export type RequireFields<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type ModelType<T> = { [k in keyof T]: z.infer<T[k]> };
export type Err = { message: string; path: string[] };
export type None = z.infer<typeof none>;
