import { Elysia } from 'elysia';

import { userService } from '@/modules/user/service';
import { payload } from '@/modules/user/payload';
import { loadAuthContext } from '@/lib/auth';
import { schema } from '@/lib/util/schema';

export const userRoutes = new Elysia({ name: 'User.Routes', prefix: '/users' })
  .post(
    '/user-has-permission',
    async function (params) {
      return await userService.userHasPermission({ body: params.body });
    },
    { body: payload.userHasPermission, response: schema.status() }
  )
  .use(loadAuthContext)
  .patch(
    '/me',
    async function (params) {
      return await userService.update({
        headers: params.request.headers,
        body: params.body,
        user: params.user,
        set: params.set
      });
    },
    { response: payload.read, body: payload.update }
  )
  .post(
    '/verify-password',
    async function (params) {
      return await userService.verifyPassword({
        headers: params.request.headers,
        body: params.body,
        set: params.set
      });
    },
    { body: payload.verifyPassword, response: schema.status() }
  )
  .post(
    '/set-password',
    async function (params) {
      return await userService.setPassword({
        headers: params.request.headers,
        body: params.body,
        set: params.set
      });
    },
    { body: payload.setPassword, response: schema.status() }
  )
  .post(
    '/view-backup-codes',
    async function (params) {
      return await userService.getBackupCodes({ body: params.body });
    },
    { body: payload.viewBackupCodes, response: schema.status() }
  )
  .get(
    '/me',
    function (params) {
      return params.user;
    },
    { response: payload.read }
  );
