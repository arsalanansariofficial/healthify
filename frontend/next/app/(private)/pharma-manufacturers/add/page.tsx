import { notFound } from 'next/navigation';

import Component from '@/app/(private)/pharma-manufacturers/add/component';
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();

  return <Component />;
}
