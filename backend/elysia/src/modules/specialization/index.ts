import { Elysia } from 'elysia';

import { service } from '@/modules/specialization/service';
import { payload } from '@/modules/specialization/payload';
import { loadAuthContext } from '@/lib/auth';

export const specializationRoutes = new Elysia({
  name: 'Specialization.Routes',
  prefix: '/specializations'
})
  .get('/', async params => await service.getAll({ where: params.query }), {
    response: payload.paginate,
    query: payload.where
  })
  .use(loadAuthContext)
  .patch(
    '/:name',
    async params =>
      await service.update({
        params: params.params,
        user: params.user,
        body: params.body
      }),
    { response: payload.read, body: payload.update, params: payload.name }
  )
  .delete(
    '/:name',
    async params =>
      await service.deleteSpecialization({
        params: params.params,
        user: params.user
      }),
    { response: payload.read, params: payload.name }
  )
  .get('/:name', async params => await service.get({ params: params.params }), {
    response: payload.read,
    params: payload.name
  })
  .post(
    '/',
    async params =>
      await service.create({ user: params.user, body: params.body }),
    { response: payload.read, body: payload.create }
  );
