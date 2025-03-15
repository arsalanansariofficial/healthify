import { User } from 'next-auth';
import { twMerge } from 'tailwind-merge';
import { format, parse } from 'date-fns';
import { startCase, toLower } from 'lodash';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(text: string) {
  return startCase(toLower(text));
}

export function getDate(): string {
  return format(new Date(), 'EEEE, MMMM dd, yyyy h:mm a');
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

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return window.btoa(
    bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), String())
  );
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
