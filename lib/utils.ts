import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
