import type { Payload } from '@/modules/organization/payload';
import type { Model } from '@/modules/organization/model';
import type { Roles } from '@/lib/auth/permissions';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function acceptInvitation(args: {
  payload: Payload['invitationId'];
  headers: Headers;
}) {
  const { invitation, member } = await auth.api.acceptInvitation({
    headers: args.headers,
    body: args.payload
  });
  return {
    invitation: (await prisma.invitation.findUnique({
      where: { id: invitation.id }
    })) as Model['invitation'],
    member: (await prisma.member.findUnique({
      where: { id: member.id }
    })) as Model['member']
  };
}

async function addMember(payload: Payload['addMember']) {
  const { id } = await auth.api.addMember({
    body: { ...payload, role: payload.role as Roles[] | Roles }
  });
  return (await prisma.member.findUnique({ where: { id } })) as Model['member'];
}

export const organizationService = { acceptInvitation, addMember };
