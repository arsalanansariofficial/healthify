import type { File } from 'zod/v4/core';

import bcrypt from 'bcryptjs';
import z from 'zod';

import { env } from '@/utils/config';

export type RequireFields<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type ModelType<T> = { [k in keyof T]: z.infer<T[k]> };
export type None = z.infer<typeof none>;

export const none = z.union([z.null(), z.undefined()]);

export function removeUndefinedProps<T extends Record<string, unknown>>(
  payload: T
) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value)
  );
}

export function isFile(payload?: string | File): payload is File {
  return Boolean(payload && payload instanceof File);
}

export async function hashPassword(payload: string) {
  return await bcrypt.hash(payload, env.SALT);
}
