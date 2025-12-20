'use client';

import handler from '@/components/display-toast';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyTitle,
  EmptyHeader,
  EmptyContent,
  EmptyDescription
} from '@/components/ui/empty';
import useHookForm from '@/hooks/use-hook-form';
import { seed } from '@/lib/actions';

export default function Page() {
  const { handleSubmit, pending } = useHookForm(handler, seed);

  return (
    <section>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Seed Database</EmptyTitle>
          <EmptyDescription>
            This will populate the database with predefined roles, permissions,
            and default users. Useful for development or resetting demo
            environments.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            type='submit'
            disabled={pending}
            onClick={handleSubmit}
            className='w-full cursor-pointer'
          >
            {pending ? 'Seeding...' : 'Seed database'}
          </Button>
        </EmptyContent>
      </Empty>
    </section>
  );
}
