import { describe, expect, it } from 'bun:test';

import { setUpTests, login, api } from '@/test/lib';

setUpTests();

describe('User routes', () => {
  it('logs in an existing user with valid credentials', async () => {
    const cookie = await login();
    expect(cookie).toContain('jwt');
  });

  it('returns the authenticated user profile', async () => {
    const cookie = await login();
    const { status } = await api.users.me.get({ headers: { Cookie: cookie } });
    expect(status).toBe(200);
  });

  it('logs out a single session', async () => {
    const cookie = await login();
    const { status } = await api.users.logout.post(undefined, {
      headers: { Cookie: cookie }
    });

    expect(status).toBe(200);
  });

  it('logs out all sessions for the current user', async () => {
    const cookie = await login();
    const { status } = await api.users.logout.all.post(undefined, {
      headers: { Cookie: cookie }
    });

    expect(status).toBe(200);
  });

  it('return invalid login credentials', async () => {
    const { status } = await api.users.login.post({
      email: 'invalid.email@example.com',
      password: '#Secret123'
    });

    expect(status).toBe(400);
  });

  it('registers a user and sets an auth cookie', async () => {
    const { response, status } = await api.users.post({
      password: '#Gwentennyson10',
      name: 'Gwen Tennyson',
      email: 'gwen@cn.com'
    });

    expect(response.headers?.get('set-cookie')).toContain('jwt');
    expect(status).toBe(200);
  });

  it('updates the authenticated user profile', async () => {
    const cookie = await login();
    const { status } = await api.users.me.patch(
      {
        profile: {
          phoneNumber: 'Updated',
          address: 'Updated',
          bio: 'Updated',
          gender: 'male'
        },
        email: 'updated@example.com',
        password: '#Secret123',
        name: 'Updated'
      },
      { headers: { Cookie: cookie } }
    );

    expect(status).toBe(200);
  });
});
