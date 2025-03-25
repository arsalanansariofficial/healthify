'use client';

import Link from 'next/link';

import { User } from 'next-auth';
import { hasPermission } from '@/lib/utils';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar({ user }: { user: User }) {
  const sidebarEntries = Array.from(SIDEBAR_ITEMS.entries());

  return (
    <aside className="sticky top-[5.25em] hidden h-[calc(100vh-10em)] backdrop-blur-xs lg:block">
      <ScrollArea className="h-full pr-8">
        <ul className="space-y-4 font-semibold">
          {sidebarEntries.map(
            ([header, items]) =>
              hasPermission(user.permissions, header.permission) && (
                <li key={header.label} className="space-y-2">
                  <span className="text-muted-foreground text-xs">
                    {header.label}
                  </span>
                  <ul>
                    {items.map(item => (
                      <li key={item.label}>
                        <Link href={item.url} className="text-sm">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )
          )}
        </ul>
      </ScrollArea>
    </aside>
  );
}
