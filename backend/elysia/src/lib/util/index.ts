import type { File } from 'zod/v4/core';

import bcrypt from 'bcryptjs';
import os from 'node:os';

import { env } from '@/lib/config';

export function isFileError(
  e: Error
): e is { code: keyof typeof os.constants.errno } & NodeJS.ErrnoException {
  return (
    'code' in e &&
    typeof e.code === 'string' &&
    Object.keys(os.constants.errno).includes(e.code)
  );
}

export function removeUndefinedProps<T extends Record<string, unknown>>(
  payload: T
) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value)
  );
}

export function isFile(payload?: string | File | null): payload is File {
  return Boolean(payload && payload instanceof File);
}

export async function hashPassword(payload: string) {
  return await bcrypt.hash(payload, env.SALT);
}
