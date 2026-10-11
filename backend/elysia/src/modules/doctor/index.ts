import { Elysia } from 'elysia';

import { service } from '@/modules/doctor/service';
import { payload } from '@/modules/doctor/payload';
import { model } from '@/modules/user/model';
import { loadAuthContext } from '@/lib/auth';

export const routes = new Elysia({ name: 'Doctor.Routes', prefix: '/doctors' })
  .get('/', async params => await service.getAll({ where: params.query }), {
    response: payload.paginate,
    query: payload.where
  })
  .use(loadAuthContext)
  .post(
    '/register',
    async params =>
      await service.register({
        headers: params.request.headers,
        body: params.body,
        user: params.user,
        set: params.set
      }),
    { response: model.user, body: payload.create }
  )
  .patch(
    '/update',
    async params =>
      await service.update({
        headers: params.request.headers,
        body: params.body,
        user: params.user,
        set: params.set
      }),
    { response: model.user, body: payload.update }
  )
  .delete(
    '/de-register',
    async params =>
      await service.deRegister({
        headers: params.request.headers,
        user: params.user,
        set: params.set
      }),
    { response: model.user }
  );
