import { User } from 'next-auth';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasRole(roles: User['roles'], name: string) {
  return roles.map(r => r.name.toLowerCase()).includes(name.toLowerCase());
}

export function hasPermission(roles: User['roles'], name: string) {
  const permissionsArray = roles.map(r => r.permissions).flat();
  const permissions = permissionsArray.map(p => p.name.toLowerCase());
  return permissions.includes(name.toLowerCase());
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
