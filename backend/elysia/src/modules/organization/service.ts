import type { Payload } from '@/modules/organization/payload';
import type { Model } from '@/modules/organization/model';
import type { Roles } from '@/lib/auth/permissions';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function acceptInvitation(args: {
  payload: Payload['invitationId'];
  headers: Headers;
}) {
  const { invitation, member } = await auth.api.acceptInvitation({
    headers: args.headers,
    body: args.payload
  });
  return {
    invitation: (await db.query.invitation.findFirst({
      where: { id: invitation.id }
    })) as Model['invitation'],
    member: (await db.query.member.findFirst({
      where: { id: member.id }
    })) as Model['member']
  };
}

async function addMember(payload: Payload['addMember']) {
  const { id } = await auth.api.addMember({
    body: { ...payload, role: payload.role as Roles[] | Roles }
  });
  return (await db.query.member.findFirst({
    where: { id }
  })) as Model['member'];
}

export const organizationService = { acceptInvitation, addMember };
