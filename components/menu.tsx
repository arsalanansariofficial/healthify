import { User } from 'next-auth';
import Link from 'next/link';

import { hasPermission } from '@/lib/utils';

import { Button } from './ui/button';

type Props = {
  user: User;
  entries: [
    { label: string; permission: string },
    { url: string; label: string; permission: string }[]
  ][];
};

export default function Menu({ entries, user }: Props) {
  return (
    <ul className='space-y-4'>
      {entries.map(
        ([header, items]) =>
          hasPermission(user.permissions, header.permission) && (
            <li className='space-y-2' key={header.label}>
              <h1 className='text-muted-foreground px-2 text-sm'>
                {header.label}
              </h1>
              <ul className='space-y-1'>
                {items.map(
                  item =>
                    hasPermission(user.permissions, item.permission) && (
                      <li key={item.label}>
                        <Button
                          asChild
                          className='block text-sm'
                          variant='ghost'
                        >
                          <Link href={item.url}>{item.label}</Link>
                        </Button>
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
