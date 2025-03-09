'use client';

import Link from 'next/link';

import { User } from 'next-auth';
import * as CN from '@/components/ui/card';
import { cn, hasPermission } from '@/lib/utils';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-[7.35em] hidden h-[calc(100vh-12em)] min-w-[10em] scroll-mt-0 xl:block">
      <CN.Card className="h-full">
        <ScrollArea className="h-full">
          <CN.CardContent>
            <ul>
              {SIDEBAR_ITEMS.map(
                (item, index) =>
                  hasPermission(user.permissions, item.permission) && (
                    <li key={index}>
                      <Link
                        href={item.url}
                        className={cn('block font-semibold', {
                          'mt-3': index && item.isHeader,
                          'text-muted-foreground text-xs': item.isHeader
                        })}
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
