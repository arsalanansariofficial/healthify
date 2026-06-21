import type { HTTPHeaders } from 'elysia/types';

import type { Payload } from '@/modules/user/payload';
import type { Model } from '@/modules/user/model';

import { prisma } from '@/lib/prisma';
import { replace } from '@/lib/file';
import { auth } from '@/lib/auth';

async function update(args: {
  payload: Payload['userWithProfile'];
  user: Model['userWithProfile'];
  set: { headers: HTTPHeaders };
  headers: Headers;
}) {
  const { profile: $profile, user: $user } = args.payload;

  if ($user) {
    const image = await replace({
      replaceWith: $user.image,
      url: args.user.image
    });
    await auth.api.updateUser({
      body: { ...$user, image },
      headers: args.headers
    });
  }

  if ($profile) {
    const cover = await replace({
      url: args.user.profile?.cover,
      replaceWith: $profile.cover
    });
    await prisma.userProfile.upsert({
      create: { ...$profile, userId: args.user.id, cover },
      where: { userId: args.user.id },
      update: { ...$profile, cover }
    });
  }

  const { headers: cookie } = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: args.headers,
    returnHeaders: true
  });

  const updated = await prisma.user.findUnique({
    where: { id: args.user.id },
    include: { profile: true }
  });

  args.set.headers['set-cookie'] = cookie.getSetCookie();
  return updated || args.user;
}

async function setPassword(args: { newPassword: string; headers: Headers }) {
  return await auth.api.setPassword({
    body: { newPassword: args.newPassword },
    headers: args.headers
  });
}

async function verifyPassword(args: { password: string; headers: Headers }) {
  return await auth.api.verifyPassword({
    body: { password: args.password },
    headers: args.headers
  });
}

async function getBackupCodes({ userId }: Payload['viewBackupCodes']) {
  return await auth.api.viewBackupCodes({ body: { userId } });
}

export const userService = {
  getBackupCodes,
  verifyPassword,
  setPassword,
  update
};
