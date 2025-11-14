import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Kbd } from '@/components/ui/kbd';
import { MAIL_TO } from '@/lib/constants';
import * as EMPTY from '@/components/ui/empty';
import * as IG from '@/components/ui/input-group';

export default function Info(props: { title: string; message: string }) {
  const router = useRouter();

  return (
    <EMPTY.Empty>
      <EMPTY.EmptyHeader>
        <EMPTY.EmptyTitle>{props.title}</EMPTY.EmptyTitle>
        <EMPTY.EmptyDescription>{props.message}</EMPTY.EmptyDescription>
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
  );
}
