import { Elysia } from 'elysia';

import { doctorService } from '@/modules/doctor/service';
import { payload as dp } from '@/modules/doctor/payload';
import { payload as up } from '@/modules/user/payload';
import { userService } from '@/modules/user/service';
import { model as dm } from '@/modules/doctor/model';

export const publicRoutes = new Elysia({ name: 'Public.Routes' })
  .post(
    '/users/user-has-permission',
    async ({ body }) => await userService.userHasPermission(body),
    { body: up.userHasPermission, response: up.status }
  )
  .get('/doctors', async ({ query }) => await doctorService.getAll(query), {
    response: dm.paginatedDoctors,
    query: dp.query
  });
