import { User } from 'next-auth';

import { auth } from '@/auth';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import Component from '@/app/permissions/component';

export default async function Page() {
  const session = await auth();

  return (
    <Session expiresAt={session?.user?.expiresAt}>
      <Header />
      <main className="row-start-2 mx-8 grid grid-cols-[auto_1fr] gap-4">
        <Sidebar user={session?.user as User} />
        <Component />
      </main>
      <Footer />
    </Session>
  );
}
