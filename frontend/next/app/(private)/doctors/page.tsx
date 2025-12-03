import { SubscriptionStatus } from '@prisma/client';
import { User } from 'next-auth';
import { notFound } from 'next/navigation';

import Component from '@/app/(private)/doctors/component';
import { auth } from '@/auth';
import { ROLES } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { hasRole } from '@/lib/utils';

export default async function Page() {
  const [session, specialities] = await Promise.all([
    auth(),
    prisma.speciality.findMany()
  ]);

  if (!session?.user) notFound();

  let doctors = await prisma.userRole.findMany({
    select: {
      user: {
        include: {
          timings: true,
          UserSpecialities: {
            select: { speciality: { select: { name: true } } }
          }
        }
      }
    },
    where: { role: { name: ROLES.DOCTOR as string } }
  });

  if (!hasRole(session.user.roles, ROLES.ADMIN as string)) {
    const subscriptions = await prisma.user.findUnique({
      select: {
        subscription: {
          select: {
            membership: {
              select: {
                hospitalMemberships: {
                  select: {
                    hospital: { select: { doctors: { select: { id: true } } } }
                  }
                }
              }
            }
          }
        }
      },
      where: {
        id: session?.user?.id,
        subscription: { status: SubscriptionStatus.active }
      }
    });

    doctors = [];

    if (subscriptions)
      doctors = await prisma.userRole.findMany({
        select: {
          user: {
            include: {
              timings: true,
              UserSpecialities: {
                select: { speciality: { select: { name: true } } }
              }
            }
          }
        },
        where: {
          role: { name: ROLES.DOCTOR as string },
          user: {
            id: {
              in: subscriptions?.subscription?.membership.hospitalMemberships
                .map(hm => hm.hospital.doctors)
                .flatMap(d => d)
                .map(d => d.id)
            }
          }
        }
      });
  }

  return (
    <Component
      doctors={doctors.map(d => d.user)}
      key={specialities.map(s => s.updatedAt).toString()}
      specialities={specialities}
      user={session?.user as User}
    />
  );
}
