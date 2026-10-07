import type { HTTPHeaders } from 'elysia/types';

import { auth } from '@/lib/auth';

async function update(params: {
  set: { headers: HTTPHeaders };
  headers: Headers;
}) {
  const { headers: cookie } = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: params.headers,
    returnHeaders: true
  });

  params.set.headers['set-cookie'] = cookie.getSetCookie();
}

export const session = { update } as const;
