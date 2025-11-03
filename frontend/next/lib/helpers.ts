export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function toAbsoluteUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${cleanPath}`;
}

export function formatDate(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    currency,
    style: 'currency'
  }).format(amount);
}

export function formatDateTime(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
    minute: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function getSlug(title: string): string {
  if (!title || typeof title !== 'string') {
    return '';
  }

  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const getInitials = (
  name: string | null | undefined,
  count?: number
): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase());

  return count && count > 0
    ? initials.slice(0, count).join('')
    : initials.join('');
};

export const getTimeZones = (): { label: string; value: string }[] => {
  const timezones = Intl.supportedValuesOf('timeZone');

  return timezones
    .map(timezone => {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'shortOffset'
      });
      const parts = formatter.formatToParts(new Date());
      const offset =
        parts.find(part => part.type === 'timeZoneName')?.value || '';
      const formattedOffset = offset === 'GMT' ? 'GMT+0' : offset;

      return {
        label: `(${formattedOffset}) ${timezone.replace(/_/g, ' ')}`,
        numericOffset: parseInt(
          formattedOffset.replace('GMT', '').replace('+', '') || '0'
        ),
        value: timezone
      };
    })
    .sort((a, b) => a.numericOffset - b.numericOffset);
};

export const throttle = (
  func: (...args: unknown[]) => void,
  limit: number
): ((...args: unknown[]) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function (this: unknown, ...args: unknown[]) {
    if (lastRan === null) {
      func.apply(this, args);
      return (lastRan = Date.now());
    }

    if (lastFunc !== null) {
      clearTimeout(lastFunc);
    }

    lastFunc = setTimeout(
      () => {
        if (Date.now() - (lastRan as number) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      },
      limit - (Date.now() - (lastRan as number))
    );
  };
};
