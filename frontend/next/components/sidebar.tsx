'use client';

import { User } from 'next-auth';
import Menu from '@/components/menu';
import { SIDEBAR } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-[5.25em] hidden h-[calc(100vh-10em)] backdrop-blur-xs lg:block">
      <ScrollArea className="h-full pr-8">
        <Menu user={user} entries={Array.from(SIDEBAR.entries())} />
      </ScrollArea>
    </aside>
  );
}
