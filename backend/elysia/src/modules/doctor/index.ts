import { Elysia } from 'elysia';

import { doctorService } from '@/modules/doctor/service';
import { payload } from '@/modules/doctor/payload';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/user/model';

export const doctorRoutes = new Elysia({
  name: 'Doctor.Routes',
  prefix: '/doctors'
})
  .get(
    '/',
    async function (params) {
      return await doctorService.getAll({ where: params.query });
    },
    { response: payload.paginate, query: payload.where }
  )
  .use(loadAuthContext)
  .patch(
    '/register',
    async function (params) {
      return await doctorService.register({
        headers: params.request.headers,
        body: params.body,
        user: params.user,
        set: params.set
      });
    },
    { response: model.user, body: payload.create }
  )
  .delete(
    '/de-register',
    async function (params) {
      return await doctorService.deRegister({
        headers: params.request.headers,
        user: params.user,
        set: params.set
      });
    },
    { response: model.user }
  );
