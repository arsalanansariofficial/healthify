import { factories } from '@strapi/strapi';

interface Request {
  appointmentStatus: string;
  prescription: string;
  priority: string;
  doctor: string;
  notes: string;
  start: string;
  end: string;
  date: Date;
}

export default factories.createCoreController(
  'api::appointment.appointment',
  ({ strapi }) => ({
    async create(ctx) {
      const { user } = ctx.state;
      const {
        appointmentStatus = 'Pending',
        priority = 'Normal',
        prescription = '',
        notes = '',
        doctor,
        start,
        date,
        end
      } = ctx.request.body as Request;

      const existingAppointment = await strapi
        .documents('api::appointment.appointment')
        .findFirst({
          filters: { doctor: { documentId: doctor }, start, date, end }
        });

      if (existingAppointment)
        return ctx.badRequest(
          'An appointment for the same date and time already exist.'
        );

      const isTimingExist = await strapi
        .documents('api::doctor-schedule.doctor-schedule')
        .findFirst({
          filters: {
            day: new Date(date).toLocaleDateString('en-US', {
              weekday: 'long'
            }) as 'Sunday',
            doctor: { documentId: doctor },
            start,
            end
          }
        });

      if (!isTimingExist)
        return ctx.badRequest('Incorrect appointment date and time.');

      const appointment = await strapi
        .documents('api::appointment.appointment')
        .create({
          data: {
            appointmentStatus: appointmentStatus as 'Pending',
            user: { documentId: user.documentId },
            doctor: { documentId: doctor },
            priority: priority as 'Low',
            prescription,
            notes,
            start,
            date,
            end
          },
          populate: {
            user: { fields: ['id', 'documentId', 'email', 'username'] },
            doctor: true
          },
          status: 'published'
        });

      ctx.body = appointment;
    }
  })
);
