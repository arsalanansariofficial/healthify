import { User } from 'next-auth';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function getDate() {
  return new Date().toLocaleString('en-US', {
    hour12: true,
    month: 'long',
    day: '2-digit',
    weekday: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function removeDuplicateTimes(
  timings: { duration: number; time: string; id: number }[]
) {
  const timeSet = new Set();

  return timings.filter(item => {
    if (timeSet.has(item.time)) return false;
    timeSet.add(item.time);
    return true;
  });
}
