import { factories, type Core, type Data } from '@strapi/strapi';

interface Request {
  timings: { start: string; end: string; day: string }[];
  specializations: string[];
  experienceYears: number;
  consultationFee: number;
  licenseNumber: string;
}

type Day = NonNullable<
  Data.ContentType<'api::doctor-schedule.doctor-schedule'>['day']
>;

async function createTimings(
  strapi: Core.Strapi,
  doctorId: Data.ID,
  timing: Request['timings'][0]
) {
  const schedules = await strapi
    .documents('api::doctor-schedule.doctor-schedule')
    .findMany({
      filters: { doctor: { id: doctorId } },
      fields: ['documentId']
    });

  await Promise.all(
    schedules.map(schedule =>
      strapi
        .documents('api::doctor-schedule.doctor-schedule')
        .delete({ documentId: schedule.documentId })
    )
  );

  const created = await strapi
    .documents('api::doctor-schedule.doctor-schedule')
    .create({
      data: { ...timing, doctor: { id: doctorId }, day: timing.day as Day },
      status: 'published'
    });

  return created.documentId;
}

async function getOrCreateSpecialization(strapi: Core.Strapi, name: string) {
  const existing = await strapi
    .documents('api::specialization.specialization')
    .findFirst({ filters: { name } });

  if (existing) return existing.documentId;

  const created = await strapi
    .documents('api::specialization.specialization')
    .create({ status: 'published', data: { name } });

  return created.documentId;
}

export default factories.createCoreController(
  'api::doctor.doctor',
  ({ strapi }) => ({
    async create(ctx) {
      const { user } = ctx.state;
      const {
        experienceYears,
        consultationFee,
        specializations,
        licenseNumber,
        timings
      }: Request = ctx.request.body;

      let doctor = await strapi
        .documents('api::doctor.doctor')
        .findFirst({ filters: { user: { id: user.id } } });

      if (!doctor)
        doctor = await strapi
          .documents('api::doctor.doctor')
          .create({
            data: {
              user: { id: user.id },
              experienceYears,
              consultationFee,
              licenseNumber
            },
            status: 'published'
          });

      const specializationIds = await Promise.all(
        specializations.map(specialization =>
          getOrCreateSpecialization(strapi, specialization)
        )
      );

      const timingIds = await Promise.all(
        timings.map(timing => createTimings(strapi, doctor.id, timing))
      );

      const { id } = (await strapi
        .documents('plugin::users-permissions.role')
        .findFirst({ filters: { name: 'Doctor' } }))!;

      await strapi
        .documents('plugin::users-permissions.user')
        .update({ documentId: user.documentId, data: { role: { id } } });

      ctx.body = await strapi
        .documents('api::doctor.doctor')
        .update({
          populate: {
            user: { fields: ['name', 'documentId', 'id', 'username', 'email'] },
            specializations: true,
            timings: true
          },
          data: {
            specializations: { set: specializationIds },
            timings: { set: timingIds }
          },
          documentId: doctor.documentId,
          status: 'published'
        });
    }
  })
);
