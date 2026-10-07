import { Elysia } from 'elysia';

import { organizationService } from '@/modules/organization/service';
import { payload } from '@/modules/organization/payload';
import { model } from '@/modules/organization/model';
import { loadAuthContext } from '@/lib/auth';

export const organizationRoutes = new Elysia({
  name: 'Organization.Routes',
  prefix: '/organizations'
})
  .use(loadAuthContext)
  .get(
    '/accept-invitation/:invitationId',
    async function (params) {
      return await organizationService.acceptInvitation({
        headers: params.request.headers,
        params: params.params,
        set: params.set
      });
    },
    { response: payload.invitationAndMember, params: payload.invitationId }
  )
  .post(
    '/add-member',
    async function (params) {
      return await organizationService.addMember({ body: params.body });
    },
    { body: payload.addMember, response: model.member }
  );
