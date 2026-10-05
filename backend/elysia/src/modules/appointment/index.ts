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
  .patch(
    '/confirm/:id',
    async ({ params: { id }, user }) =>
      await appointmentService.confirm({ user, id }),
    { response: model.appointment, params: payload.params }
  )
  .patch(
    '/cancel/:id',
    async ({ params: { id }, user }) =>
      await appointmentService.cancel({ user, id }),
    { response: model.appointment, params: payload.params }
  )
  .patch(
    '/update/:id',
    async ({ params: { id }, user, body }) =>
      await appointmentService.updateAppointment({ payload: body, user, id }),
    {
      body: model.appointment.pick({ prescription: true, notes: true }),
      response: model.appointment,
      params: payload.params
    }
  )
  .patch(
    '/rate/:id',
    async ({ body: { rating }, params: { id }, user }) =>
      await appointmentService.rateAppointment({ rating, user, id }),
    {
      body: payload.query.required({ rating: true }),
      response: model.appointment,
      params: payload.params
    }
  )
  .get(
    '/:id',
    async ({ params: { id }, user }) =>
      await appointmentService.get({ user, id }),
    { response: model.appointment, params: payload.params }
  )
  .patch(
    '/change-queue/:id',
    async ({ params: { id }, user, body }) =>
      await appointmentService.changeQueue({
        newQueue: body.queue,
        appointmentId: id,
        user
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
