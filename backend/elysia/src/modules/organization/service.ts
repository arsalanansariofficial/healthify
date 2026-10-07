import type { Payload } from '@/modules/organization/payload';
import type { Model } from '@/modules/organization/model';
import type { WithHeaders } from '@/lib/util/types';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function acceptInvitation(
  params: WithHeaders<{ params: Payload['invitationId'] }>
) {
  const { invitation, member } = await auth.api.acceptInvitation({
    headers: params.headers,
    body: params.params
  });

  const $invitation = await db.query.invitation.findFirst({
    where: { id: invitation.id }
  });

  const $member = await db.query.member.findFirst({ where: { id: member.id } });

  if (!$invitation && !$member) throw new Error();

  return {
    invitation: $invitation as Model['invitation'],
    member: $member as Model['member']
  };
}

async function addMember(params: { body: Payload['addMember'] }) {
  const { id } = await auth.api.addMember({ body: params.body });

  const member = await db.query.member.findFirst({ where: { id } });

  if (!member) throw new Error();
  return member as Model['member'];
}

export const organizationService = { acceptInvitation, addMember };
