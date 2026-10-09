import type { WithHeaders } from '@/lib/util/types';
import type { Model } from '@/modules/user/model';

import { type Payload, payload } from '@/modules/user/payload';
import { schema } from '@/lib/db/schema';
import { session } from '@/lib/session';
import { ApiError } from '@/lib/error';
import { replace } from '@/lib/file';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function update(
  params: WithHeaders<{ body: Payload['update']; user: Model['user'] }>
) {
  if (!params.body) return params.user;

  const { profile, ...$user } = params.body;
  const user = payload.update.parse($user);

  if (profile) {
    const cover = await replace({
      url: params.user.profile?.cover,
      replaceWith: profile?.cover
    });
    await db
      .insert(schema.userProfile)
      .values({ ...profile, userId: params.user.id, cover })
      .onConflictDoUpdate({
        target: schema.userProfile.userId,
        set: { ...profile, cover }
      });
  }

  if (user) {
    const image = await replace({
      replaceWith: user.image,
      url: params.user.image
    });
    await auth.api.updateUser({
      body: { ...user, image },
      headers: params.headers
    });
  }

  const updated = await db.query.user.findFirst({
    where: { id: params.user.id },
    with: { profile: true }
  });

  if (!updated) throw new ApiError({ message: 'Failed to updated user.' });
  await session.update({ headers: params.headers, set: params.set });
  return updated;
}

async function verifyPassword(
  params: WithHeaders<{ body: Payload['verifyPassword'] }>
) {
  return await auth.api.verifyPassword({
    headers: params.headers,
    body: params.body
  });
}

async function setPassword(
  params: WithHeaders<{ body: Payload['setPassword'] }>
) {
  return await auth.api.setPassword({
    headers: params.headers,
    body: params.body
  });
}

async function userHasPermission(params: {
  body: Payload['userHasPermission'];
}) {
  return await auth.api.userHasPermission({ body: params.body });
}

async function getBackupCodes(params: { body: Payload['viewBackupCodes'] }) {
  return await auth.api.viewBackupCodes({ body: params.body });
}

export const userService = {
  userHasPermission,
  getBackupCodes,
  verifyPassword,
  setPassword,
  update
};
