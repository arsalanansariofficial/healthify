'use client';

import Link from 'next/link';

import { User } from 'next-auth';
import * as CN from '@/components/ui/card';
import { hasPermission } from '@/lib/utils';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-[7.35em] hidden max-h-[calc(100vh-10.5em)] min-w-[10em] scroll-mt-0 lg:block">
      <CN.Card className="h-full">
        <ScrollArea className="h-full">
          <CN.CardContent>
            <ul className="space-y-1">
              {SIDEBAR_ITEMS.map(
                (item, index) =>
                  hasPermission(user.roles, item.permission) && (
                    <li key={index}>
                      <Link
                        href={item.url}
                        className="text-muted-foreground block text-xs font-semibold"
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
              )}
            </ul>
          </CN.CardContent>
        </ScrollArea>
      </CN.Card>
    </aside>
  );
}
