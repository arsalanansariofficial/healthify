import type { UserWithProfile } from '@/lib/util/types';
import type { Payload } from '@/modules/user/payload';

import { remove, upload } from '@/lib/file';
import { prisma } from '@/lib/prisma';
import { isFile } from '@/lib/util';
import { auth } from '@/lib/auth';

async function update({
  payload,
  user
}: {
  payload: Payload['userProfile'];
  user: UserWithProfile;
}) {
  return await prisma.$transaction(async prisma => {
    let { image, cover } = payload;
    let userCover: undefined | string | null = null;
    let userImage: undefined | string | null = null;

    if (user.profile) {
      userImage = user.profile.image;
      userCover = user.profile.cover;
    }

    if (image && userImage) await remove(userImage);
    if (cover && userCover) await remove(userCover);

    if (image === null && userImage) await remove(userImage);
    if (cover === null && userCover) await remove(userCover);

    if (isFile(image)) image = await upload(image);
    if (isFile(cover)) cover = await upload(cover);

    const updates = { ...payload, image, cover };

    return await prisma.user.update({
      data: { profile: { upsert: { create: updates, update: updates } } },
      include: { profile: true },
      where: { id: user.id }
    });
  });
}

async function setPassword({
  newPassword,
  headers
}: {
  newPassword: string;
  headers: Headers;
}) {
  return await auth.api.setPassword({ body: { newPassword }, headers });
}

async function verifyPassword({
  password,
  headers
}: {
  password: string;
  headers: Headers;
}) {
  return await auth.api.verifyPassword({ body: { password }, headers });
}

export const userService = { verifyPassword, setPassword, update };
