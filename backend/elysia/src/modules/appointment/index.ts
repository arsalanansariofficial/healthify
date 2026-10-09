import { Elysia } from 'elysia';

import { service } from '@/modules/appointment/service';
import { payload } from '@/modules/appointment/payload';
import { loadAuthContext } from '@/lib/auth';

export const appointmentRoutes = new Elysia({
  name: 'Appointment.Routes',
  prefix: '/appointments'
})
  .use(loadAuthContext)
  .get(
    '/',
    async params =>
      await service.getAll({ where: params.query, user: params.user }),
    { response: payload.paginated, query: payload.where }
  )
  .patch(
    '/:id/rate',
    async params =>
      await service.rate({
        params: params.params,
        body: params.body,
        user: params.user
      }),
    { response: payload.read, body: payload.rate, params: payload.id }
  )
  .patch(
    '/:id/change-queue',
    async params =>
      await service.changeQueue({
        params: params.params,
        user: params.user,
        body: params.body
      }),
    { body: payload.changeQueue, response: payload.read, params: payload.id }
  )
  .patch(
    '/:id/prescribe',
    async params =>
      await service.prescribe({
        params: params.params,
        body: params.body,
        user: params.user
      }),
    { body: payload.prescribe, response: payload.read, params: payload.id }
  )
  .delete(
    '/:id',
    async params =>
      await service.deleteAppointment({
        params: params.params,
        user: params.user
      }),
    { response: payload.read, params: payload.id }
  )
  .post(
    '/',
    async params =>
      await service.create({ body: params.body, user: params.user }),
    { response: payload.read, body: payload.create }
  )
  .patch(
    '/:id/:action',
    async params =>
      await service.confirmOrCancel({
        params: params.params,
        user: params.user
      }),
    { params: payload.actions, response: payload.read }
  )
  .get(
    '/:id',
    async params =>
      await service.get({ params: params.params, user: params.user }),
    { response: payload.read, params: payload.id }
  );
