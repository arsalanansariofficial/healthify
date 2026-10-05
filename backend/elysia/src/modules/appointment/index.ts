import { Elysia } from 'elysia';

import { appointmentService } from '@/modules/appointment/service';
import { payload } from '@/modules/appointment/payload';
import { model } from '@/modules/appointment/model';
import { loadAuthContext } from '@/lib/auth';

export const appointmentRoutes = new Elysia({
  name: 'Appointment.Routes',
  prefix: '/appointments'
})
  .use(loadAuthContext)
  .post(
    '/',
    async ({ user, body }) =>
      await appointmentService.create({ payload: body, user }),
    { response: model.appointment, body: payload.appointment }
  )
  .patch(
    '/:id',
    async ({ params: { id }, user, body }) =>
      await appointmentService.update({ payload: body, user, id }),
    { response: model.appointment, params: payload.params, body: payload.query }
  )
  .get(
    '/:id',
    async ({ params: { id }, user }) =>
      await appointmentService.get({ user, id }),
    { response: model.appointment, params: payload.params }
  )
  .patch(
    '/change-queue/:id',
    ({ params: { id }, body }) =>
      appointmentService.changeQueue({
        newQueue: body.queue,
        appointmentId: id
      }),
    {
      response: model.appointment,
      body: payload.changeQueue,
      params: payload.params
    }
  )
  .delete(
    '/:id',
    async ({ params: { id }, user }) =>
      await appointmentService.deleteAppointment({ user, id }),
    { response: model.appointment, params: payload.params }
  )
  .get(
    '/',
    async ({ query, user }) =>
      await appointmentService.getAll({ params: query, user }),
    { response: model.paginatedAppointments, query: payload.query }
  );
