import { Elysia } from 'elysia';

import { specializationService } from '@/modules/specialization/service';
import { payload as sp } from '@/modules/specialization/payload';
import { model as sm } from '@/modules/specialization/model';
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
  })
  .get(
    '/specializations',
    async ({ query }) => await specializationService.getAll(query),
    { response: sm.paginatedSpecialization, query: sp.query }
  );
