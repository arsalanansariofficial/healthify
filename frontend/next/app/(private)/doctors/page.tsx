import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { hasRole } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { SubscriptionStatus } from '@prisma/client';
import Component from '@/app/(private)/doctors/component';

export default async function Page() {
  const [session, specialities] = await Promise.all([
    auth(),
    prisma.speciality.findMany()
  ]);

  if (!session?.user) notFound();

  let doctors = await prisma.userRole.findMany({
    where: { role: { name: ROLES.DOCTOR as string } },
    select: {
      user: {
        include: {
          timings: true,
          UserSpecialities: {
            select: { speciality: { select: { name: true } } }
          }
        }
      }
    }
  });

  if (!hasRole(session.user.roles, ROLES.ADMIN as string)) {
    const subscriptions = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
        subscription: { status: SubscriptionStatus.active }
      },
      select: {
        subscription: {
          select: {
            membership: {
              select: {
                hospitalMemberships: {
                  select: {
                    hospital: {
                      select: {
                        doctors: {
                          select: { id: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    doctors = [];

    if (subscriptions) {
      doctors = await prisma.userRole.findMany({
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
        },
        select: {
          user: {
            include: {
              timings: true,
              UserSpecialities: {
                select: { speciality: { select: { name: true } } }
              }
            }
          }
        }
      });
    }
  }

  return (
    <Component
      specialities={specialities}
      user={session?.user as User}
      doctors={doctors.map(d => d.user)}
      key={specialities.map(s => s.updatedAt).toString()}
    />
  );
}
