import nodemailer from 'nodemailer';
import * as fns from 'date-fns';

import type { FactoryResults, WhereTuple } from '@/lib/util/types';
import type { Permissions, Roles } from '@/lib/auth/permissions';

import { type Env, env } from '@/lib/config';
import { ApiError } from '@/lib/error';
import { auth } from '@/lib/auth';

export const mailer = nodemailer.createTransport(env.SMTP_URL);

export function clean<T>(input: T): NonNullable<T> | undefined {
  if (Array.isArray(input))
    return input
      .filter(v => v !== null && v !== undefined)
      .map(v => clean(v))
      .filter(v => v !== undefined) as NonNullable<T>;

  if (typeof input !== 'object' || input === null)
    return input as NonNullable<T>;

  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null)
    return input as NonNullable<T>;

  const entries = Object.entries(input)
    .filter(([, child]) => child !== null && child !== undefined)
    .map(([key, child]) => [key, clean(child)] as const)
    .filter(([, child]) => child !== undefined);

  if (!entries.length) return undefined;
  return Object.fromEntries(entries) as NonNullable<T>;
}

export async function checkUserPermission(params: {
  permissions: Permissions;
  userId: string;
}) {
  const { success } = await auth.api.userHasPermission({
    body: { permissions: params.permissions, userId: params.userId }
  });

  if (!success)
    throw new ApiError({ message: 'Permission denied.', code: 'Forbidden' });

  return true;
}

export function toQuery<T extends object>(v: T) {
  return Object.fromEntries(
    Object.entries(v).map(([k, v]): WhereTuple => {
      if (v && typeof v === 'object') return [k, { eq: v }];
      if (!v) return [k, { isNull: true }];
      return [k, v];
    })
  );
}

export function checkUserRole(params: { roles?: string | null; role: Roles }) {
  if (!params.roles?.includes(params.role))
    throw new ApiError({
      message: 'Permission denied.',
      code: 'Forbidden',
      name: 'Forbidden'
    });
  return true;
}

export function toFactoryResults<T extends Record<string, () => unknown>>(
  params: T
) {
  return Object.fromEntries(
    Object.entries(params).map(([key, factory]) => [key, factory()])
  ) as FactoryResults<typeof params>;
}

export function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  const isInteger = Number.isInteger(parsed);
  return isInteger && parsed > 0 ? parsed : fallback;
}

export function hasValidAuthMethod(method: string) {
  return env.BETTER_AUTH_ACCEPT_METHODS.includes(
    method.toLowerCase() as Env['BETTER_AUTH_ACCEPT_METHODS'][number]
  );
}

export function toMinutes(time: string) {
  const parsed = fns.parse(time, 'HH:mm', new Date());
  return fns.getHours(parsed) * 60 + fns.getMinutes(parsed);
}

export function isFile(payload?: string | File | null): payload is File {
  return Boolean(payload && payload instanceof File);
}

export function join(payload: unknown[], separator = ' | ') {
  return `(${payload.join(separator)})`;
}
