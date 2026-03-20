import bcrypt from 'bcryptjs';

import type { Prisma } from '~/generated/prisma/client';

import { InvalidCredentialsError, EmailAlreadyExistError } from '@/utils/error';
import { type RequireFields, hashPassword, isFile } from '@/utils/lib';
import { generateToken, verifyToken } from '@/utils/token';
import { type Model } from '@/modules/user/model';
import { remove, upload } from '@/utils/file';
import { prisma } from '@/utils/prisma';
import { env } from '@/utils/config';

export async function update({
  payload,
  user
}: {
  user: RequireFields<Model['user'], 'email' | 'id'>;
  payload: Model['userProfilePayload'];
}) {
  return await prisma.$transaction(async prisma => {
    await cleanUserProfile(prisma, user.id);
    await validateNewEmail({ updated: payload.email, original: user.email });

    let { password, imageUrl, coverUrl } = payload;
    if (isFile(imageUrl)) imageUrl = await upload(imageUrl);
    if (isFile(coverUrl)) coverUrl = await upload(coverUrl);
    if (password) password = await hashPassword(password);

    return await prisma.user.update({
      data: {
        profile: {
          upsert: {
            create: { ...payload?.profile, imageUrl, coverUrl },
            update: { ...payload?.profile, imageUrl, coverUrl }
          }
        },
        email: payload.email,
        name: payload.name,
        password
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
  const user = await prisma.user.findFirst({
    include: { profile: true, tokens: true },
    where: { OR: [{ email, id }] }
  });

  if (!user) throw new InvalidCredentialsError();

  const { password: originalPassword, ...userWithoutPassword } = user;
  if (password && !(await bcrypt.compare(password, originalPassword)))
    throw new InvalidCredentialsError();

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
    throw new EmailAlreadyExistError([updated]);
}

function removeToken(token: string) {
  return setTimeout(
    async () => await prisma.token.delete({ where: { token } }),
    env.JWT_EXPIRES_IN
  );
}
