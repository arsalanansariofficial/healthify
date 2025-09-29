import { SearchIcon } from 'lucide-react';

import Router from '@/components/router';
import { SOCIAL } from '@/lib/constants';
import { Kbd } from '@/components/ui/kbd';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';

import {
  Empty,
  EmptyTitle,
  EmptyHeader,
  EmptyContent,
  EmptyDescription
} from '@/components/ui/empty';

export default function Info(props: { title: string; message: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{props.title}</EmptyTitle>
        <EmptyDescription>{props.message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <InputGroup className="sm:w-3/4">
          <Router>
            <InputGroupInput
              name="search"
              placeholder="Try searching for pages..."
            />
          </Router>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
        <EmptyDescription>
          Need help? <a href={SOCIAL.EMAIL as string}>Contact support</a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
