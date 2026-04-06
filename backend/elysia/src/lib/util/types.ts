import z from 'zod';

import type { Prisma } from '~/generated/prisma/client';
import type { Model } from '@/modules/user/model';

export type UserAndPayload = {
  user: RequireFields<
    Prisma.UserGetPayload<{
      include: { profile: true; tokens: true };
      omit: { password: true };
    }>,
    'email' | 'id'
  >;
  payload: Model['userProfilePayload'];
};
export type RequireFields<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type ModelType<T> = { [k in keyof T]: z.infer<T[k]> };
export type Err = { path: Array<string>; message: string };
export const none = z.union([z.null(), z.undefined()]);
export type None = z.infer<typeof none>;
