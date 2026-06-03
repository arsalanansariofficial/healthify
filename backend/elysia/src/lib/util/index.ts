import type { File } from 'zod/v4/core';

import nodemailer from 'nodemailer';
import os from 'node:os';
import z from 'zod';

import { env } from '@/lib/config';

export const mailer = nodemailer.createTransport(env.SMTP_URL);
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

export function hasValidAuthMethod(method: string) {
  return env.BETTER_AUTH_ACCEPT_METHODS.includes(method as 'post' | 'get');
}

export function isFile(payload?: string | File | null): payload is File {
  return Boolean(payload && payload instanceof File);
}

export const file = z.union([
  z.string().trim().toLowerCase(),
  z.file().min(env.MIN_FILE_SIZE).mime(['image/png']).max(env.MAX_FILE_SIZE)
]);
