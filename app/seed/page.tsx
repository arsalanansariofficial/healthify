'use client';

import { seed } from '@/lib/actions';
import * as EMPTY from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import useHookForm from '@/hooks/use-hook-form';
import handler from '@/components/display-toast';

export default function Page() {
  const { handleSubmit, pending } = useHookForm(handler, seed);

  return (
    <main className="row-start-2 mx-8 grid place-items-center">
      <section>
        <EMPTY.Empty>
          <EMPTY.EmptyHeader>
            <EMPTY.EmptyTitle>Seed Database</EMPTY.EmptyTitle>
            <EMPTY.EmptyDescription>
              This will populate the database with predefined roles,
              permissions, and default users. Useful for development or
              resetting demo environments.
            </EMPTY.EmptyDescription>
          </EMPTY.EmptyHeader>
          <EMPTY.EmptyContent>
            <Button
              type="submit"
              disabled={pending}
              onClick={handleSubmit}
              className="w-full cursor-pointer"
            >
              {pending ? 'Seeding...' : 'Seed database'}
            </Button>
          </EMPTY.EmptyContent>
        </EMPTY.Empty>
      </section>
    </main>
  );
}
