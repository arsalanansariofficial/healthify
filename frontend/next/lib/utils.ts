import * as P from '@prisma/client';
import { titleCase } from 'moderndash';
import { twMerge } from 'tailwind-merge';
import { format, parse } from 'date-fns';
import { AuthError, User } from 'next-auth';
import { clsx, type ClassValue } from 'clsx';

import * as CONST from '@/lib/constants';
import { randomUUID } from 'crypto';

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

export function getFileWithName(files: FileList) {
  const fileUUID = randomUUID();
  const file: File = files && files[0];
  const fileExtension = file?.type?.split(CONST.HOME).at(-1);

  return [file, fileUUID, fileExtension] as [File, string, string];
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

export function catchAuthError(error: Error) {
  if (error instanceof AuthError) {
    switch (error.type) {
      case 'CredentialsSignin':
        return { success: false, message: CONST.INVALID_CREDENTIALS };
      default:
        return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
    }
  }

  throw error;
}

export function catchErrors(error: Error) {
  if (error instanceof P.Prisma.PrismaClientKnownRequestError) {
    return { success: false, message: CONST.UNIQUE_ERR };
  }

  if (error instanceof P.Prisma.PrismaClientInitializationError) {
    return { success: false, message: CONST.PRISMA_INIT };
  }

  if (error instanceof Error && 'code' in error) {
    switch (error.code) {
      case 'ENOSPC':
        return { success: false, message: CONST.SPACE_FULL };
      case 'EAUTH':
        return { success: false, message: CONST.E_AUTH_FAILED };
      case 'ETIMEDOUT':
        return { success: false, message: CONST.SMTP_TIME_OUT };
      case 'ECONNECTION':
        return { success: false, message: CONST.E_CONNECT_FAILED };
      case 'EACCES':
        return { success: false, message: CONST.PERMISSION_DENIED };
      case 'ENOENT':
        return { success: false, message: CONST.DIRECTORY_NOT_FOUND };
    }
  }

  if (error instanceof AuthError) {
    switch (error.type) {
      case 'CredentialsSignin':
        return { success: false, message: CONST.INVALID_CREDENTIALS };
      default:
        return { success: false, message: CONST.SERVER_ERROR_MESSAGE };
    }
  }

  throw error;
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
