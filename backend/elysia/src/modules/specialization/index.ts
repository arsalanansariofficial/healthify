import { Elysia } from 'elysia';

import { specializationService } from '@/modules/specialization/service';
import { payload } from '@/modules/specialization/payload';
import { loadAuthContext } from '@/lib/auth';

export const specializationRoutes = new Elysia({
  name: 'Specialization.Routes',
  prefix: '/specializations'
})
  .get(
    '/',
    async function (params) {
      return await specializationService.getAll({ where: params.query });
    },
    { response: payload.paginate, query: payload.where }
  )
  .use(loadAuthContext)
  .patch(
    '/:name',
    async function (params) {
      return await specializationService.update({
        params: params.params,
        user: params.user,
        body: params.body
      });
    },
    { response: payload.read, body: payload.update, params: payload.name }
  )
  .delete(
    '/:name',
    async function (params) {
      return await specializationService.deleteSpecialization({
        params: params.params,
        user: params.user
      });
    },
    { response: payload.read, params: payload.name }
  )
  .get(
    '/:name',
    async function (params) {
      return await specializationService.get({ params: params.params });
    },
    { response: payload.read, params: payload.name }
  )
  .post(
    '/',
    async function (params) {
      return await specializationService.create({
        user: params.user,
        body: params.body
      });
    },
    { response: payload.read, body: payload.create }
  );
