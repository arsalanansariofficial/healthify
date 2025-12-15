import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { hasRole } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { SubscriptionStatus } from '@prisma/client';
import { ADMIN_ROLE, DOCTOR_ROLE } from '@/lib/constants';
import Component from '@/app/(private)/doctors/component';

export default async function Page() {
  const [session, specialities] = await Promise.all([
    auth(),
    prisma.speciality.findMany()
  ]);

  if (!session?.user) notFound();

  let doctors = await prisma.userRole.findMany({
    where: { role: { name: DOCTOR_ROLE } },
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

  if (!hasRole(session.user.roles, ADMIN_ROLE)) {
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
          role: { name: DOCTOR_ROLE },
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
