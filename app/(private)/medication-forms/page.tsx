import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from '@/app/(private)/medication-forms/component';

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) notFound();
  const forms = await prisma.medicationForm.findMany();

  return (
    <Component
      forms={forms}
      user={session.user}
      key={forms.map(c => c.updatedAt).toString()}
    />
  );
}
