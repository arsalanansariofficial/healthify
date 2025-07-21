import Link from 'next/link';
import { User } from 'next-auth';

import { hasPermission } from '@/lib/utils';

type Props = {
  user: User;
  entries: [
    { label: string; permission: string },
    { url: string; label: string; permission: string }[]
  ][];
};

export default function Menu({ user, entries }: Props) {
  return (
    <ul className="space-y-4 font-semibold">
      {entries.map(
        ([header, items]) =>
          hasPermission(user.permissions, header.permission) && (
            <li key={header.label} className="space-y-2">
              <span className="text-muted-foreground text-xs">
                {header.label}
              </span>
              <ul>
                {items.map(
                  item =>
                    hasPermission(user.permissions, item.permission) && (
                      <li key={item.label}>
                        <Link
                          href={item.url}
                          className="active:bg-accent block max-w-fit rounded-md text-sm hover:underline hover:underline-offset-4 active:px-2 active:py-1"
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </li>
          )
      )}
    </ul>
  );
}
