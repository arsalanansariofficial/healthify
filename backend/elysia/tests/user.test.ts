import { beforeEach, afterAll, describe, expect, test } from 'bun:test';
import { APIError } from 'better-auth';
import { StatusMap } from 'elysia';

import type { Payload } from '@/modules/user/payload';

import {
  getSessionCookie,
  resetDisk,
  setupDb,
  resetDb,
  unknown,
  gwen,
  api
} from '@/tests/fixtures/db';
import { auth, ctx } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

describe('tests for user resource', () => {
  afterAll(async () => {
    await Promise.all([resetDb(), resetDisk()]);
    await prisma.$disconnect();
  });

  beforeEach(setupDb);

  test('should signup a new user', async () => {
    const payload = {
      password: 'Charm.Caster@123',
      email: 'charm@cn.com',
      name: 'Charm Caster'
    };

    const { token, user } = await auth.api.signUpEmail({ body: payload });
    expect(token).not.toBeNull();
    expect(user).not.toBeNull();

    const userFromDb = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userFromDb?.email).toBe(payload.email);
    expect(userFromDb).not.toBeNull();
  });

  test('should update valid user fields', async () => {
    const headers = await ctx.getAuthHeaders({ userId: gwen.id });
    const bio = 'max tennyson';

    const { status, data } = await api.users.me.patch(
      { profile: { bio } },
      getSessionCookie(headers)
    );

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: data?.id }
    });
    expect(status).toBe(StatusMap.OK);
    expect(userProfile?.bio).toBe(bio);
  });

  test('should upload profile picture for a user', async () => {
    const headers = await ctx.getAuthHeaders({ userId: gwen.id });
    const { status, data } = await api.users.me.patch(
      {
        'user.image': Bun.file('tests/fixtures/images/image.png')
      } as Payload['userWithProfile'],
      getSessionCookie(headers)
    );

    const user = await prisma.user.findUnique({ where: { id: data?.id } });
    expect(status).toBe(StatusMap.OK);
    expect(user?.image).toBeString();
    expect(user?.image).toBeTruthy();
  });

  test('should delete account for authenticated user', async () => {
    const headers = await ctx.getAuthHeaders({ userId: gwen.id });

    const response = await auth.api.deleteUser({ body: {}, headers });
    expect(response.success).toBeTrue();

    const user = await prisma.user.findUnique({ where: { id: gwen.id } });
    expect(user).toBeNull();
  });

  test('should not update invalid user fields', async () => {
    const { status } = await api.users.me.patch({
      profile: { age: 1 },
      user: { name: 1 }
    } as unknown as Payload['userWithProfile']);

    expect(status).toBe(StatusMap['Unprocessable Content']);
  });

  test('should not login a non existing user', async () => {
    expect(auth.api.signInEmail({ body: unknown })).rejects.toThrowError(
      'Invalid email or password'
    );
  });

  test('should get profile for a user', async () => {
    const headers = await ctx.getAuthHeaders({ userId: gwen.id });
    const { status } = await api.users.me.get(getSessionCookie(headers));
    expect(status).toBe(StatusMap.OK);
  });

  test('should login an existing user', async () => {
    const { session, user } = await ctx.login({ userId: gwen.id });
    expect(user).not.toBe(null);
    expect(session.token).not.toBe(null);
  });

  test('should not get profile for unauthenticated user', async () => {
    const { status } = await api.users.me.get();
    expect(status).toBe(StatusMap.Unauthorized);
  });

  test('should not delete account for unauthenticated user', async () => {
    expect(auth.api.deleteUser({ body: {} })).rejects.toBeInstanceOf(APIError);
  });
});
