'use client';

import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Kbd } from '@/components/ui/kbd';
import * as EMPTY from '@/components/ui/empty';
import * as IG from '@/components/ui/input-group';
import { IS_PRODUCTION, MAIL_TO } from '@/lib/constants';

type Props = { reset: () => void; error: Error & { digest?: string } };

export default function Error({ error }: Props) {
  const router = useRouter();

  return (
    <main className="row-start-2 mx-8 grid place-items-center">
      <section className="space-y-4 text-center">
        <EMPTY.Empty>
          <EMPTY.EmptyHeader>
            <EMPTY.EmptyTitle>500 - Internal Server Error</EMPTY.EmptyTitle>
            <EMPTY.EmptyDescription>
              {!IS_PRODUCTION
                ? error.message
                : 'There is some error while processing your request, please try again after some time!'}
            </EMPTY.EmptyDescription>
          </EMPTY.EmptyHeader>
          <EMPTY.EmptyContent>
            <IG.InputGroup className="sm:w-3/4">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  router.push(`/${formData.get('search') as string}`);
                }}
              >
                <IG.InputGroupInput
                  name="search"
                  placeholder="Try searching for pages..."
                />
              </form>
              <IG.InputGroupAddon>
                <SearchIcon />
              </IG.InputGroupAddon>
              <IG.InputGroupAddon align="inline-end">
                <Kbd>/</Kbd>
              </IG.InputGroupAddon>
            </IG.InputGroup>
            <EMPTY.EmptyDescription>
              Need help? <a href={MAIL_TO}>Contact support</a>
            </EMPTY.EmptyDescription>
          </EMPTY.EmptyContent>
        </EMPTY.Empty>
      </section>
    </main>
  );
}
