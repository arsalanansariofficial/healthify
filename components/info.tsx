import { SearchIcon } from 'lucide-react';

import Router from '@/components/router';
import { Kbd } from '@/components/ui/kbd';
import { MAIL_TO } from '@/lib/constants';

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
          Need help? <a href={MAIL_TO}>Contact support</a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
