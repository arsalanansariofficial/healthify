import { Elysia } from 'elysia';

import { doctorService } from '@/modules/doctor/service';
import { model as dm } from '@/modules/doctor/model';
import { payload } from '@/modules/doctor/payload';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/user/model';

export const doctorRoutes = new Elysia({
  name: 'Doctor.Routes',
  prefix: '/doctors'
})
  .get('/', async ({ query }) => await doctorService.getAll(query), {
    response: dm.paginatedDoctors,
    query: payload.query
  })
  .use(loadAuthContext)
  .patch(
    '/register',
    async ({ request: { headers }, user, body, set }) =>
      await doctorService.register({ payload: body, headers, user, set }),
    { body: payload.register, response: model.user }
  )
  .delete(
    '/de-register',
    async ({ request: { headers }, user, set }) =>
      await doctorService.deRegister({ headers, user, set }),
    { response: model.user }
  );
