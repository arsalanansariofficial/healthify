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
    async ({ request: { headers }, params }) =>
      await organizationService.acceptInvitation({ payload: params, headers }),
    { response: model.invitationAndMember, params: payload.invitationId }
  )
  .post(
    '/add-member',
    async ({ body }) => await organizationService.addMember(body),
    { body: payload.addMember, response: model.member }
  );
