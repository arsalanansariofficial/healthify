import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from 'next-auth';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { hasPermission } from '@/lib/utils';

type Props = {
  user: User;
  entries: [
    { label: string; permission: string },
    { url: string; label: string; permission: string; icon: IconDefinition }[]
  ][];
};

export default function Menu({ entries, user }: Props) {
  return (
    <ul className='space-y-4'>
      {entries.map(
        ([header, items]) =>
          hasPermission(user.permissions, header.permission) && (
            <li className='space-y-2' key={header.label}>
              <h1 className='text-muted-foreground text-sm'>{header.label}</h1>
              <ul className='space-y-1'>
                {items.map(
                  item =>
                    hasPermission(user.permissions, item.permission) && (
                      <li key={item.label}>
                        <Button
                          asChild
                          className='block text-sm font-normal'
                          variant='ghost'>
                          <Link
                            className='flex items-center justify-start gap-4'
                            href={item.url}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.label}</span>
                          </Link>
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
