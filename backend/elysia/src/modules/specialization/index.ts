import { Elysia } from 'elysia';

import { specializationService } from '@/modules/specialization/service';
import { payload } from '@/modules/specialization/payload';
import { model } from '@/modules/specialization/model';
import { loadAuthContext } from '@/lib/auth';

export const specializationRoutes = new Elysia({
  name: 'Specialization.Routes',
  prefix: '/specializations'
})
  .use(loadAuthContext)
  .get(
    '/:name',
    async ({ params: { name } }) => await specializationService.get(name),
    { response: model.specialization, params: payload.params }
  )
  .post(
    '/',
    async ({ user, body }) =>
      await specializationService.insert({ payload: body, user }),
    { response: model.specialization, body: payload.specialization }
  )
  .patch(
    '/:name',
    async ({ params: { name }, user, body }) =>
      await specializationService.update({ payload: body, user, name }),
    {
      response: model.specialization,
      body: payload.specialization,
      params: payload.params
    }
  )
  .delete(
    '/:name',
    async ({ params: { name } }) =>
      await specializationService.deleteSpecialization(name),
    { response: model.specialization, params: payload.params }
  );
