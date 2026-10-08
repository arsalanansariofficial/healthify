import { Elysia } from 'elysia';

import { appointmentService } from '@/modules/appointment/service';
import { payload } from '@/modules/appointment/payload';
import { loadAuthContext } from '@/lib/auth';

export const appointmentRoutes = new Elysia({
  name: 'Appointment.Routes',
  prefix: '/appointments'
})
  .use(loadAuthContext)
  .get(
    '/',
    async function (params) {
      return await appointmentService.getAll({
        where: params.query,
        user: params.user
      });
    },
    { response: payload.paginated, query: payload.where }
  )
  .patch(
    '/:id/rate',
    async function (params) {
      return await appointmentService.rate({
        params: params.params,
        body: params.body,
        user: params.user
      });
    },
    { response: payload.read, body: payload.rate, params: payload.id }
  )
  .patch(
    '/:id/change-queue',
    async function (params) {
      return await appointmentService.changeQueue({
        params: params.params,
        user: params.user,
        body: params.body
      });
    },
    { body: payload.changeQueue, response: payload.read, params: payload.id }
  )
  .patch(
    '/:id/prescribe',
    async function (params) {
      return await appointmentService.prescribe({
        params: params.params,
        body: params.body,
        user: params.user
      });
    },
    { body: payload.prescribe, response: payload.read, params: payload.id }
  )
  .delete(
    '/:id',
    async function (params) {
      return await appointmentService.deleteAppointment({
        params: params.params,
        user: params.user
      });
    },
    { response: payload.read, params: payload.id }
  )
  .post(
    '/',
    async function (params) {
      return await appointmentService.create({
        body: params.body,
        user: params.user
      });
    },
    { response: payload.read, body: payload.create }
  )
  .patch(
    '/:id/:action',
    async function (params) {
      return await appointmentService.confirmOrCancel({
        params: params.params,
        user: params.user
      });
    },
    { params: payload.actions, response: payload.read }
  )
  .get(
    '/:id',
    async function (params) {
      return await appointmentService.get({
        params: params.params,
        user: params.user
      });
    },
    { response: payload.read, params: payload.id }
  );
