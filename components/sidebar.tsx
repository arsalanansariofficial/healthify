'use client';

import Link from 'next/link';

import * as CN from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const items = [
  { url: '/dashboard', label: 'Dashboard' },
  { url: '/doctors', label: 'Doctors' },
  { url: '/specialities', label: 'Specialities' }
];

export default function Sidebar() {
  return (
    <aside className="sticky top-[7.35em] hidden max-h-[calc(100vh-10.5em)] min-w-[10em] lg:block">
      <CN.Card className="h-full">
        <ScrollArea className="h-full">
          <CN.CardContent>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.url}
                    className="text-muted-foreground block text-xs font-semibold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CN.CardContent>
        </ScrollArea>
      </CN.Card>
    </aside>
  );
}
