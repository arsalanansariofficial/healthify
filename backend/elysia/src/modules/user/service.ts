import bcrypt from 'bcryptjs';

import type { UserAndPayload, RequireFields } from '@/lib/util/types';
import type { Prisma } from '~/generated/prisma/client';

import { InvalidCredentialsError, EmailAlreadyExistError } from '@/lib/error';
import { generateToken, verifyToken } from '@/lib/token';
import { hashPassword, isFile } from '@/lib/util';
import { type Model } from '@/modules/user/model';
import { remove, upload } from '@/lib/file';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/config';

export async function update({ payload, user }: UserAndPayload) {
  return await prisma.$transaction(async prisma => {
    await validateNewEmail({ updated: payload.email, original: user.email });
    const updates = await getUpdatedUserPayload({ payload, user });
    return await prisma.user.update({
      data: {
        profile: {
          upsert: {
            create: {
              ...updates.profile,
              imageUrl: updates.imageUrl,
              coverUrl: updates.coverUrl
            },
            update: {
              ...updates.profile,
              imageUrl: updates.imageUrl,
              coverUrl: updates.coverUrl
            }
          }
        },
        password: updates.password,
        email: updates.email,
        name: updates.name
      },
      include: { profile: true },
      omit: { password: true },
      where: { id: user.id }
    });
  });
}

export async function validateCredentials({
  password,
  email,
  id
}: {
  password?: string;
  email?: string;
  id?: string;
}) {
  const error = new InvalidCredentialsError();
  error.errors.splice(0);

  const user = await prisma.user.findFirst({
    include: { profile: true, tokens: true },
    where: { OR: [{ email, id }] }
  });

  if (!user) {
    if (email)
      error.errors.push({ message: 'Email is invalid.', path: [email] });
    if (id)
      error.errors.push({
        message: `User with ${id} does not exist.`,
        path: [id]
      });
    throw error;
  }

  const { password: originalPassword, ...userWithoutPassword } = user;
  if (password && !(await bcrypt.compare(password, originalPassword))) {
    if (password)
      error.errors.push({ message: 'Password is invalid.', path: [password] });
    throw error;
  }

  return userWithoutPassword;
}

export async function createToken(user: RequireFields<Model['user'], 'id'>) {
  const token = await prisma.token.create({
    data: { token: generateToken(user.id), userId: user.id }
  });

  removeToken(token.token);
  return { ...user, tokens: [token] };
}

export async function create(payload: Model['userPayload']) {
  const user = await prisma.user.create({
    data: { ...payload, password: await bcrypt.hash(payload.password, 8) },
    omit: { password: true }
  });

  return await createToken(user);
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

export async function login({ password, email }: Model['loginPayload']) {
  const user = await validateCredentials({ password, email });
  return await createToken(user);
}

export async function logout(jwt: string) {
  await prisma.token.delete({ where: { token: jwt } });
  return { message: 'User has been logged out.', success: true };
}

export async function get() {
  return await prisma.user.findMany({ omit: { password: true } });
}

async function getUpdatedUserPayload({ payload, user }: UserAndPayload) {
  let { password, imageUrl, coverUrl } = payload;
  let userCover: string | null = null;
  let userImage: string | null = null;

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

  if (password) password = await hashPassword(password);

  return { ...payload, imageUrl, coverUrl, password };
}

async function cleanUserProfile(prisma: Prisma.TransactionClient, id: string) {
  const userProfile = await prisma.userProfile.findUnique({
    select: { imageUrl: true, coverUrl: true },
    where: { userId: id }
  });

  if (userProfile && userProfile.imageUrl) await remove(userProfile.imageUrl);
  if (userProfile && userProfile.coverUrl) await remove(userProfile.coverUrl);
}

async function validateNewEmail({
  original,
  updated
}: {
  original: string;
  updated?: string;
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

function removeToken(token: string) {
  return setTimeout(
    async () => await prisma.token.delete({ where: { token } }),
    env.JWT_EXPIRES_IN
  );
}
