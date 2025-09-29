import { titleCase } from 'moderndash';
import { twMerge } from 'tailwind-merge';
import { AuthError, User } from 'next-auth';
import { clsx, type ClassValue } from 'clsx';

import {
  parse,
  format,
  isBefore,
  setHours,
  setMinutes,
  setSeconds
} from 'date-fns';

import { MESSAGES, SMTP } from '@/lib/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(text: string) {
  return titleCase(String(text).toLowerCase());
}

export function formatTime(time: string) {
  return format(parse(time, 'HH:mm:ss', new Date()), 'hh:mm a');
}

export function hasRole(roles: User['roles'], name: string) {
  return roles?.map(r => r.name.toLowerCase()).includes(name.toLowerCase());
}

export function hasPermission(permissions: User['permissions'], name: string) {
  return permissions
    ?.map(p => p.name.toLowerCase())
    .includes(name.toLowerCase());
}

export function getDate(date?: string, day = true, time = true): string {
  if (!day) return format(date || new Date(), 'MMMM dd, yyyy');
  if (!time) return format(date || new Date(), 'EEEE, MMMM dd, yyyy');
  return format(date || new Date(), 'EEEE, MMMM dd, yyyy h:mm a');
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return window.btoa(
    bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), String())
  );
}

export function formatChange(current: number, previous: number) {
  if (!previous && !current) return '0%';
  if (!previous && current > 0) return '+100%';

  const diff = ((current - previous) / previous) * 100;
  const sign = diff > 0 ? '+' : String();

  return `${sign}${diff.toFixed(1)}%`;
}

export function removeDuplicateTimes(
  timings: { duration: number; time: string; id: string }[]
) {
  const timeSet = new Set();

  return timings.filter(item => {
    if (timeSet.has(item.time)) return false;
    timeSet.add(item.time);
    return true;
  });
}

export function shortId(length = 5) {
  const numbers = '0123456789';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';

  const chars = upper + lower + numbers;
  const array = new Uint8Array(length);

  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join('');
}

export function isPastByTime(date: Date, time: string, diff: number) {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return isBefore(
    new Date(),
    new Date(
      setSeconds(
        setMinutes(setHours(date, hours), minutes),
        seconds
      ).getTime() - diff
    )
  );
}

export function catchAuthError(error: Error) {
  if (error instanceof AuthError) {
    switch (error.type) {
      case 'CredentialsSignin':
        return { success: false, message: MESSAGES.AUTH.INVALID_CREDENTIALS };
      default:
        return { success: false, message: MESSAGES.SYSTEM.SERVER_ERROR };
    }
  }

  throw error;
}

export function catchErrors(error: Error) {
  if (error.name === 'PrismaClientKnownRequestError') {
    return { success: false, message: MESSAGES.SYSTEM.UNIQUE_ERROR };
  }

  if (error.name === 'PrismaClientInitializationError') {
    return { success: false, message: MESSAGES.SYSTEM.PRISMA_INIT_FAILED };
  }

  if (error instanceof Error && 'code' in error) {
    switch (error.code) {
      case 'ETIMEDOUT':
        return { success: false, message: SMTP.ERRORS.TIMEOUT };
      case 'EAUTH':
        return { success: false, message: SMTP.ERRORS.AUTH_FAILED };
      case 'ENOENT':
        return { success: false, message: MESSAGES.FILE.NOT_FOUND };
      case 'ENOSPC':
        return { success: false, message: MESSAGES.FILE.SPACE_FULL };
      case 'ECONNECTION':
        return { success: false, message: SMTP.ERRORS.CONNECT_FAILED };
      case 'EDNS':
        return { success: false, message: MESSAGES.USER.EMAIL_BOUNCED };
      case 'EACCES':
        return { success: false, message: MESSAGES.FILE.PERMISSION_DENIED };
    }
  }

  return { success: false, message: error.message };
}

export function hasFormChanged<T extends Record<string, unknown>>(
  initialValues: T,
  currentValues: T
): boolean {
  return Object.keys(initialValues).some(key => {
    const initialValue = initialValues[key];
    const currentValue = currentValues[key];

    if (currentValue == null) return false;

    if (typeof currentValue === 'string') {
      return currentValue.trim() !== String() && currentValue !== initialValue;
    }

    if (typeof currentValue === 'number') {
      return currentValue !== initialValue;
    }

    if (Array.isArray(currentValue)) {
      if (!Array.isArray(initialValue)) return true;
      if (currentValue.length !== initialValue.length) return true;

      return currentValue.some((item, i) => {
        if (typeof item === 'object' && typeof initialValue[i] === 'object') {
          return JSON.stringify(item) !== JSON.stringify(initialValue[i]);
        }

        return item !== initialValue[i];
      });
    }

    if (typeof currentValue === 'object') {
      return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
    }

    return false;
  });
}

export function env<T>(key: string, fallback: T) {
  const value = process.env[key];

  if (!value) return fallback;
  if (typeof fallback === 'number') return Number(value);
  if (typeof fallback === 'boolean') return value === 'true';

  return value;
}
