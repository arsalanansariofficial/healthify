import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/appointments/component';

export default async function Page() {
  const [session, specialities] = await Promise.all([
    auth(),
    prisma.speciality.findMany()
  ]);

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
        <Sidebar user={session?.user as User} />
        <Component
          appointments={[
            {
              id: '1',
              time: '10',
              status: 'pending',
              date: '2025-08-01',
              patientName: 'Patient 1'
            },
            {
              id: '2',
              time: '11',
              date: '2025-08-02',
              status: 'confirmed',
              patientName: 'Patient 2'
            },
            {
              id: '3',
              time: '12',
              date: '2025-08-03',
              status: 'cancelled',
              patientName: 'Patient 3'
            }
          ]}
          user={session?.user as User}
          key={specialities.map(s => s.updatedAt).toString()}
        />
      </main>
    </Session>
  );
}
