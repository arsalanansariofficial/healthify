import type { Prisma } from '~/generated/prisma/client';

import { EmailAlreadyExistError } from '@/lib/error';
import { type Model } from '@/modules/user/model';
import { remove, upload } from '@/lib/file';
import { prisma } from '@/lib/prisma';
import { isFile } from '@/lib/util';

export async function update({
  payload,
  user
}: {
  user: Prisma.UserGetPayload<{
    include: { profile: true };
    omit: { image: true };
  }> & { image?: string | null };
  payload: Model['payload'];
}) {
  return await prisma.$transaction(async prisma => {
    await validateNewEmail({ updated: payload.email, original: user.email });

    let { imageUrl, coverUrl } = payload;
    let userCover: undefined | string | null = null;
    let userImage: undefined | string | null = null;

    if (user.profile) {
      userImage = user.profile.imageUrl;
      userCover = user.profile.coverUrl;
    }

    if (imageUrl && userImage) await remove(userImage);
    if (coverUrl && userCover) await remove(userCover);

    if (imageUrl === null && userImage) await remove(userImage);
    if (coverUrl === null && userCover) await remove(userCover);

    if (isFile(imageUrl)) imageUrl = await upload(imageUrl);
    if (isFile(coverUrl)) coverUrl = await upload(coverUrl);

    const { profileUpdates, userUpdates } = {
      profileUpdates: {
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        gender: payload.gender,
        bio: payload.bio,
        imageUrl,
        coverUrl
      },
      userUpdates: { email: payload.email, name: payload.name }
    };

    return await prisma.user.update({
      data: {
        profile: { upsert: { create: profileUpdates, update: profileUpdates } },
        ...userUpdates
      },
      include: { profile: true },
      where: { id: user.id }
    });
  });
}

export async function deleteUser(id: string) {
  return await prisma.$transaction(async prisma => {
    const userProfile = await prisma.userProfile.findUnique({
      select: { imageUrl: true, coverUrl: true },
      where: { userId: id }
    });

    if (userProfile && userProfile.imageUrl) await remove(userProfile.imageUrl);
    if (userProfile && userProfile.coverUrl) await remove(userProfile.coverUrl);
    return await prisma.user.delete({ where: { id } });
  });
}

async function validateNewEmail({
  original,
  updated
}: {
  updated?: string | null;
  original?: string;
}) {
  if (!updated || updated === original) return;
  if (await prisma.user.findUnique({ where: { email: updated } }))
    throw new EmailAlreadyExistError([
      {
        message: `A user with email ${updated} already exist.`,
        path: [updated]
      }
    ]);
}
