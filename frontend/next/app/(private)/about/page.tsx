import { readFile } from 'fs/promises';
import { notFound } from 'next/navigation';
import path from 'path';

import Component from '@/app/(private)/about/component';
import { auth } from '@/auth';
import { DIRECTORIES } from '@/lib/constants';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session?.user) notFound();

  const user = await prisma.user.findUnique({
    select: { bio: true, id: true, name: true },
    where: { id: session?.user?.id }
  });

  if (!user) notFound();

  if (user.bio)
    user.bio = (
      await readFile(
        path.join(
          process.cwd(),
          DIRECTORIES.PUBLIC as string,
          user.bio as string
        )
      )
    ).toString('utf-8');

  return <Component user={user} />;
}
