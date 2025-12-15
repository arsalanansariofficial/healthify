import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import Component from '@/app/(private)/subscriptions/add/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  return <Component />;
}
