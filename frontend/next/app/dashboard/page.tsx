import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export default async function Page() {
  const session = await auth();

  return (
    <main className="row-start-2 grid place-items-center">
      <section className="grid place-items-center space-y-4 p-4">
        <h1 className="text-xl font-bold">{session?.user?.email}</h1>
        <form
          action={async function () {
            'use server';
            return await signOut({ redirectTo: '/login' });
          }}
        >
          <Button variant="secondary" className="cursor-pointer">
            Signout
          </Button>
        </form>
      </section>
    </main>
  );
}
