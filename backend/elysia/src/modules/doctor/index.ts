import { Elysia } from 'elysia';

import { doctorService } from '@/modules/doctor/service';
import { payload } from '@/modules/doctor/payload';
import { loadAuthContext } from '@/lib/auth';
import { model } from '@/modules/user/model';

export const doctorRoutes = new Elysia({
  name: 'Doctor.Routes',
  prefix: '/doctors'
})
  .use(loadAuthContext)
  .get(
    '/de-register',
    async ({ request: { headers }, user, set }) =>
      await doctorService.deRegister({ headers, user, set }),
    { response: model.user }
  )
  .post(
    '/register',
    async ({ request: { headers }, user, body, set }) =>
      await doctorService.register({ payload: body, headers, user, set }),
    { response: model.user, body: payload.doctor }
  );
