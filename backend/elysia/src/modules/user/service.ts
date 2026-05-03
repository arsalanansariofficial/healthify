import type { UserWithProfile } from '@/lib/util/types';

import { removeUndefinedProps, isFile } from '@/lib/util';
import { type Model } from '@/modules/user/model';
import { remove, upload } from '@/lib/file';
import { prisma } from '@/lib/prisma';

async function update({
  payload,
  user
}: {
  payload: Model['payload'];
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

    const { name, ...profileUpdates } = { ...payload, image, cover };

    return await prisma.user.update({
      data: {
        profile: { upsert: { create: profileUpdates, update: profileUpdates } },
        ...removeUndefinedProps({ name })
      },
      include: { profile: true },
      where: { id: user.id }
    });
  });
}

async function deleteUser(user: UserWithProfile) {
  return await prisma.$transaction(async prisma => {
    if (user.profile && user.profile.image) await remove(user.profile.image);
    if (user.profile && user.profile.cover) await remove(user.profile.cover);
    await prisma.user.delete({ where: { id: user.id } });
    return user;
  });
}

export const userService = { deleteUser, update };
