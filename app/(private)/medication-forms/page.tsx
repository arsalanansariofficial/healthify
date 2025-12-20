import { notFound } from 'next/navigation';

import Component from '@/app/(private)/medication-forms/component';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const forms = await prisma.medicationForm.findMany();

  return (
    <Component
      forms={forms}
      key={forms.map(c => c.updatedAt).toString()}
      user={session.user}
    />
  );
}
