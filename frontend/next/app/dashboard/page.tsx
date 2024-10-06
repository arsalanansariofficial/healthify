import { PrismaClient, User } from '@prisma/client';

import { auth } from '@/auth';
import Component from '@/app/dashboard/component';

const prisma = new PrismaClient();

export default async function Page() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id }
  });

  return <Component user={user as User} />;
}
