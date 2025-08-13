import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Component from './component';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';

export default async function Page() {
  const [session, specialities] = await Promise.all([
    auth(),
    prisma.speciality.findMany()
  ]);

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          appointments={[
            {
              id: '1',
              time: '10',
              status: 'PENDING',
              date: '2025-08-01',
              patientName: 'Patient 1'
            },
            {
              id: '2',
              time: '11',
              date: '2025-08-03',
              status: 'COMPLETED',
              patientName: 'Patient 4'
            },
            {
              id: '3',
              time: '11',
              date: '2025-08-02',
              status: 'CONFIRMED',
              patientName: 'Patient 2'
            },
            {
              id: '4',
              time: '12',
              date: '2025-08-03',
              status: 'CANCELLED',
              patientName: 'Patient 3'
            },
            {
              id: '5',
              time: '12',
              date: '2025-08-03',
              status: 'COMPLETED',
              patientName: 'Patient 5'
            }
          ]}
          user={session?.user as User}
          key={specialities.map(s => s.updatedAt).toString()}
        />
      </main>
    </Session>
  );
}
