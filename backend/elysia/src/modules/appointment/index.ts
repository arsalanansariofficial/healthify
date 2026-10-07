import { Elysia } from 'elysia';

import { appointmentService } from '@/modules/appointment/service';
import { payload } from '@/modules/appointment/payload';
import { loadAuthContext } from '@/lib/auth';
import { schema } from '@/lib/util/schema';

export const appointmentRoutes = new Elysia({
  name: 'Appointment.Routes',
  prefix: '/appointments'
})
  .use(loadAuthContext)
  .get(
    '/',
    async function (params) {
      return await appointmentService.getAll({
        query: params.query,
        where: params.body,
        user: params.user
      });
    },
    {
      response: payload.paginated,
      query: schema.pageQuery(),
      body: payload.where
    }
  )
  .patch(
    '/rate/:id',
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
    '/change-queue/:id',
    async function (params) {
      return await appointmentService.changeQueue({
        user: params.user,
        body: params.body
      });
    },
    { body: payload.changeQueue, response: payload.read, params: payload.id }
  )
  .patch(
    '/:id',
    async function (params) {
      return await appointmentService.update({
        params: params.params,
        body: params.body,
        user: params.user
      });
    },
    { response: payload.read, body: payload.update, params: payload.id }
  )
  .delete(
    '/:id',
    async function (params) {
      return await appointmentService.deleteAppointment({
        body: params.params,
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
    '/confirm/:id',
    async function (params) {
      return await appointmentService.confirm({
        body: params.params,
        user: params.user
      });
    },
    { response: payload.read, params: payload.id }
  )
  .patch(
    '/cancel/:id',
    async function (params) {
      return await appointmentService.cancel({
        body: params.params,
        user: params.user
      });
    },
    { response: payload.read, params: payload.id }
  )
  .get(
    '/:id',
    async function (params) {
      return await appointmentService.get({
        body: params.params,
        user: params.user
      });
    },
    { response: payload.read, params: payload.id }
  );
