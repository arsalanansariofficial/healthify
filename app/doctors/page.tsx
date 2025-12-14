import { User } from 'next-auth';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Header from '@/components/header';
import Session from '@/components/session';
import Sidebar from '@/components/sidebar';
import { ADMIN_ROLE, DOCTOR_ROLE } from '@/lib/constants';
import Component from '@/app/doctors/component';
import { hasRole } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { SubscriptionStatus } from '@prisma/client';

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
    <Session expiresAt={session?.user?.expiresAt}>
      <Header user={session?.user as User} />
      <main className="row-start-2 px-8 py-4 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
        <Sidebar user={session?.user as User} />
        <Component
          specialities={specialities}
          user={session?.user as User}
          doctors={doctors.map(d => d.user)}
          key={specialities.map(s => s.updatedAt).toString()}
        />
      </main>
    </Session>
  );
}
