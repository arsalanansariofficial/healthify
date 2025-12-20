import { User } from 'next-auth';
import Link from 'next/link';

import { hasPermission } from '@/lib/utils';

type Props = {
  user: User;
  entries: [
    { label: string; permission: string },
    { url: string; label: string; permission: string }[]
  ][];
};

export default function Menu({ entries, user }: Props) {
  return (
    <ul className='space-y-4 font-semibold'>
      {entries.map(
        ([header, items]) =>
          hasPermission(user.permissions, header.permission) && (
            <li className='space-y-2' key={header.label}>
              <span className='text-muted-foreground text-xs'>
                {header.label}
              </span>
              <ul>
                {items.map(
                  item =>
                    hasPermission(user.permissions, item.permission) && (
                      <li key={item.label}>
                        <Link
                          className='block max-w-fit rounded-md text-sm hover:underline hover:underline-offset-4'
                          href={item.url}
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
