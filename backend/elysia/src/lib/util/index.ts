import nodemailer from 'nodemailer';
import os from 'node:os';

import { env } from '@/lib/config';

export const mailer = nodemailer.createTransport(env.SMTP_URL);

export function isFileError(
  e: Error
): e is { code: keyof typeof os.constants.errno } & NodeJS.ErrnoException {
  return (
    'code' in e &&
    typeof e.code === 'string' &&
    Object.keys(os.constants.errno).includes(e.code)
  );
}

export function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  const isInteger = Number.isInteger(parsed);
  return isInteger && parsed > 0 ? parsed : fallback;
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

export function join(payload: unknown[], separator = ' | ') {
  return `(${payload.join(separator)})`;
}

export function isUnknownError(e: Error): e is Record<string, unknown> & Error {
  return Boolean(e);
}
