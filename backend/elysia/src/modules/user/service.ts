import type { HTTPHeaders } from 'elysia/types';

import type { Permissions, Roles } from '@/lib/auth/permissions';
import type { Payload } from '@/modules/user/payload';
import type { Model } from '@/modules/user/model';

import { userProfile } from '@/lib/db/schema';
import { replace } from '@/lib/file';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

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
    await db
      .insert(userProfile)
      .values({ ...$profile, userId: args.user.id, cover })
      .onConflictDoUpdate({
        set: { ...$profile, cover },
        target: userProfile.userId
      });
  }

  const { headers: cookie } = await auth.api.getSession({
    query: { disableCookieCache: true },
    headers: args.headers,
    returnHeaders: true
  });

  const updated = await db.query.user.findFirst({
    where: { id: args.user.id },
    with: { profile: true }
  });

  args.set.headers['set-cookie'] = cookie.getSetCookie();
  return updated || args.user;
}

async function userHasPermission(payload: Payload['userHasPermission']) {
  return await auth.api.userHasPermission({
    body: {
      ...payload,
      permissions: payload.permissions as Permissions,
      role: payload.role as Roles
    }
  });
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
  userHasPermission,
  getBackupCodes,
  verifyPassword,
  setPassword,
  update
};
