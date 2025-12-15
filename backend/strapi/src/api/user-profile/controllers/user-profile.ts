import { factories } from '@strapi/strapi';
import { type Context } from 'koa';

export default factories.createCoreController(
  'api::user-profile.user-profile',
  ({ strapi }) => ({
    async create(ctx: Context) {
      const { phoneNumber, address, gender, bio } = ctx.request.body;
      const { files } = ctx.request;
      const { user } = ctx.state;

      let uploadedImage = [];
      let uploadedCover = [];

      let profile = await strapi
        .documents('api::user-profile.user-profile')
        .findFirst({ filters: { user: { id: user.id } } });

      if (files?.image) {
        const existingImage = await strapi.db
          .query('plugin::upload.file')
          .findOne({
            where: {
              name: Array.isArray(files.image)
                ? files.image[0].originalFilename
                : files.image.originalFilename
            }
          });

        if (existingImage) uploadedImage = existingImage;

        if (!existingImage)
          [uploadedImage] = await strapi
            .plugin('upload')
            .service('upload')
            .upload({ files: files.image, data: {} });
      }

      if (files?.cover) {
        const existingCover = await strapi.db
          .query('plugin::upload.file')
          .findOne({
            where: {
              name: Array.isArray(files.cover)
                ? files.cover[0].originalFilename
                : files.cover.originalFilename
            }
          });

        if (existingCover) uploadedCover = existingCover;

        if (!existingCover)
          [uploadedCover] = await strapi
            .plugin('upload')
            .service('upload')
            .upload({ files: files.cover, data: {} });
      }

      if (profile)
        await strapi
          .documents('api::user-profile.user-profile')
          .update({
            data: {
              image: uploadedImage.id,
              cover: uploadedCover.id,
              phoneNumber,
              address,
              gender,
              bio
            },
            documentId: profile.documentId,
            status: 'published'
          });

      if (!profile)
        profile = await strapi
          .documents('api::user-profile.user-profile')
          .create({
            data: {
              image: uploadedImage.id,
              cover: uploadedCover.id,
              user: user.id,
              phoneNumber,
              address,
              gender,
              bio
            },
            status: 'published'
          });

      ctx.body = await strapi
        .documents('api::user-profile.user-profile')
        .findOne({
          populate: {
            user: { fields: ['id', 'documentId', 'name', 'email', 'username'] },
            cover: true,
            image: true
          },
          documentId: profile.documentId
        });
    }
  })
);
