import path from 'path';
import { readFile } from 'fs/promises';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { DIRECTORIES } from '@/lib/constants';
import Component from '@/app/(private)/about/component';

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
      await readFile(
        path.join(
          process.cwd(),
          DIRECTORIES.PUBLIC as string,
          user.bio as string
        )
      )
    ).toString('utf-8');
  }

  return <Component user={user} />;
}
