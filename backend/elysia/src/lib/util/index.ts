import type { File } from 'zod/v4/core';

import os from 'node:os';
import z from 'zod';

import { env } from '@/lib/config';

export const none = z.union([z.null(), z.undefined()]);

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

export function hasValidAuthMethod(method: string) {
  return env.BETTER_AUTH_ACCEPT_METHODS.includes(method);
}

export const file = z.union([
  z.string('File should be valid.').trim().toLowerCase(),
  z
    .file('File should be valid.')
    .min(env.MIN_FILE_SIZE, 'File should be atleast 10 KB.')
    .mime(['image/png'], 'File should be in ".png" format.')
    .max(env.MAX_FILE_SIZE, 'File shold be atmost 1 MB.')
]);
