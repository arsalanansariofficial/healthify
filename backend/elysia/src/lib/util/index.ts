import { getMinutes, getHours, parse } from 'date-fns';
import nodemailer from 'nodemailer';

import type { FactoryResults, QueryFilter } from '@/lib/util/types';
import type { Permissions, Roles } from '@/lib/auth/permissions';

import { ApiError } from '@/lib/error';
import { env } from '@/lib/config';
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

export async function can(params: {
  permissions?: Permissions;
  userId: string;
  role?: Roles;
}) {
  const { success } = await auth.api.userHasPermission({
    body: {
      permissions: params.permissions || ([] as Permissions),
      userId: params.userId,
      role: params.role
    }
  });

  if (!success)
    throw new ApiError({ message: 'Permission denied.', code: 'Forbidden' });

  return true;
}

export function toFactoryResults<T extends Record<string, () => unknown>>(
  params: T
) {
  return Object.fromEntries(
    Object.entries(params).map(([key, factory]) => [key, factory()])
  ) as FactoryResults<typeof params>;
}

export function toFilter([k, v]: [string, QueryFilter]) {
  if (v === 'null' || v === 'undefined') return [k, { isNull: true }];
  if (v && typeof v === 'object') return [k, { eq: v }];
  return [k, v];
}

export function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  const isInteger = Number.isInteger(parsed);
  return isInteger && parsed > 0 ? parsed : fallback;
}

export function toMinutes(time: string) {
  const parsed = parse(time, 'HH:mm', new Date());
  return getHours(parsed) * 60 + getMinutes(parsed);
}

export function toQuery<T extends object>(v: T) {
  return Object.fromEntries(Object.entries(v).map(toFilter));
}

export function hasValidAuthMethod(method: string) {
  return ['post', 'get'].includes(method.toLowerCase());
}

export function format(payload: unknown[], separator = ' | ') {
  return `(${payload.join(separator)})`;
}
