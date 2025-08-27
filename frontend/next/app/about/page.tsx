import path from 'path';
import { readFile } from 'fs/promises';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { PUBLIC_DIR } from '@/lib/constants';
import Component from '@/app/about/component';

export default async function Page() {
  const session = await auth();
  if (!session?.user) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { id: true, bio: true, name: true }
  });

  if (!user) notFound();

  if (user.bio) {
    user.bio = (
      await readFile(path.join(process.cwd(), PUBLIC_DIR, user.bio as string))
    ).toString('utf-8');
  }

  return (
    <Session expiresAt={session.user.expiresAt}>
      <Header user={session.user} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session.user} />
        <Component user={user} />
      </main>
    </Session>
  );
}
