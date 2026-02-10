import type { DefaultArgs } from '@prisma/client/runtime/client';
import type { Cookie } from 'elysia/cookies';

import bcrypt from 'bcryptjs';

import type { GlobalOmitConfig } from '~/generated/prisma/internal/prismaNamespace';
import type { PrismaClient } from '~/generated/prisma/internal/class';

import { generateToken, verifyToken } from '@/utils/token';
import { InvalidCredentialsError } from '@/utils/error';
import { type Model } from '@/modules/user/model';
import { remove, upload } from '@/utils/file';
import { prisma } from '@/utils/prisma';
import { env } from '@/utils/config';

export async function update(id: string, payload: Model['userProfileRequest']) {
  return await prisma.$transaction(async prisma => {
    await cleanUserProfile(prisma, id);

    let { imageUrl = null, coverUrl = null } = payload;
    if (imageUrl && imageUrl instanceof File) imageUrl = await upload(imageUrl);
    if (coverUrl && coverUrl instanceof File) coverUrl = await upload(coverUrl);

    const profile = {
      phoneNumber: payload.phoneNumber,
      address: payload.address,
      gender: payload.gender,
      bio: payload.bio,
      imageUrl,
      coverUrl
    };

    return await prisma.user.update({
      data: {
        ...(payload.password
          ? { password: await bcrypt.hash(payload.password, 8) }
          : undefined),
        profile: { upsert: { create: profile, update: profile } },
        email: payload.email,
        name: payload.name
      },
      include: { profile: true },
      omit: { password: true },
      where: { id }
    });
  });
}

export async function authenticate(
  user: {
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    name: string;
    id: string;
  },
  jwt: Cookie<unknown> | undefined
) {
  const { token } = await prisma.token.create({
    data: { token: generateToken(user.id), userId: user.id },
    select: { token: true }
  });

  setTimeout(
    async () => await prisma.token.delete({ where: { token } }),
    env.JWT_EXPIRES_IN
  );

  jwt?.set({
    secure: env.NODE_ENV === 'PRODUCTION',
    maxAge: env.JWT_EXPIRES_IN / 1000,
    sameSite: 'lax',
    httpOnly: true,
    value: token,
    path: '/'
  });

  return user;
}

export async function login(
  { password, email }: Model['loginRequest'],
  jwt?: Cookie<unknown>
) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new InvalidCredentialsError();

  return await authenticate(user, jwt);
}

export async function create(
  payload: Model['userRequest'],
  jwt?: Cookie<unknown>
) {
  const user = await prisma.user.create({
    data: { ...payload, password: await bcrypt.hash(payload.password, 8) },
    omit: { password: true }
  });

  return await authenticate(user, jwt);
}

export async function deleteUser(id: string) {
  return await prisma.$transaction(async prisma => {
    await cleanUserProfile(prisma, id);
    return await prisma.user.delete({
      omit: { password: true },
      where: { id }
    });
  });
}

export async function logoutAll(jwt: string) {
  const { id } = verifyToken(jwt);
  await prisma.token.deleteMany({ where: { userId: id } });
  return { message: 'All sessions has been revoked.', success: true };
}

export async function logout(jwt: string) {
  await prisma.token.delete({ where: { token: jwt } });
  return { message: 'User has been logged out.', success: true };
}

export async function get() {
  return await prisma.user.findMany({ omit: { password: true } });
}

async function cleanUserProfile(
  prisma: Omit<
    PrismaClient<never, GlobalOmitConfig | undefined, DefaultArgs>,
    '$disconnect' | '$connect' | '$extends' | '$use' | '$on'
  >,
  id: string
) {
  const userProfile = await prisma.userProfile.findUnique({
    select: { imageUrl: true, coverUrl: true },
    where: { userId: id }
  });

  if (userProfile && userProfile.imageUrl) await remove(userProfile.imageUrl);
  if (userProfile && userProfile.coverUrl) await remove(userProfile.coverUrl);
}
