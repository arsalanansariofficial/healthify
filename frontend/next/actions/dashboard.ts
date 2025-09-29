'use server';

import { capitalize } from 'moderndash';
import { AppointmentStatus } from '@prisma/client';

import {
  isPast,
  subWeeks,
  isFuture,
  endOfYear,
  endOfWeek,
  subMonths,
  endOfMonth,
  startOfYear,
  startOfWeek,
  startOfMonth,
  isWithinInterval
} from 'date-fns';

import prisma from '@/lib/prisma';
import { DATES } from '@/constants/date';
import { ROLES } from '@/constants/roles';
import { formatChange } from '@/lib/utils';

export async function getMonthlyUserData(
  year: number = new Date().getFullYear()
) {
  const users = await prisma.user.findMany({
    select: { createdAt: true },
    where: {
      createdAt: {
        gte: startOfYear(new Date(year, 0, 1)),
        lt: endOfYear(new Date(year, 11, 31))
      }
    }
  });

  const data = DATES.MONTHS.map(month => ({ month, users: 0 }));
  users.forEach(user => data[user.createdAt.getMonth()].users++);

  return data;
}

export async function getMonthlyAppointmentData(
  userId: string,
  year: number = new Date().getFullYear()
) {
  const appointments = await prisma.appointment.findMany({
    select: { date: true, status: true, doctorId: true },
    where: {
      patientId: userId,
      date: {
        lt: endOfYear(new Date(year, 11, 31)),
        gte: startOfYear(new Date(year, 0, 1))
      }
    }
  });

  const data = DATES.MONTHS.map(month => ({ month, appointments: 0 }));

  appointments.forEach(appointment => {
    data[appointment.date.getMonth()].appointments++;
  });

  return data;
}

export async function getDashboardCards() {
  const now = new Date();

  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });

  const prevWeekEnd = subWeeks(thisWeekEnd, 1);
  const prevWeekStart = subWeeks(thisWeekStart, 1);

  const thisMonthEnd = endOfMonth(now);
  const thisMonthStart = startOfMonth(now);
  const prevMonthEnd = subMonths(thisMonthEnd, 1);
  const prevMonthStart = subMonths(thisMonthStart, 1);

  const [appointments, users] = await Promise.all([
    prisma.appointment.findMany({ select: { date: true, status: true } }),
    prisma.user.findMany({
      select: {
        city: true,
        createdAt: true,
        UserRoles: { select: { role: { select: { name: true } } } }
      }
    })
  ]);

  const doctors = users.filter(u =>
    u.UserRoles.map(r => r.role.name).includes(ROLES.DOCTOR as string)
  );

  const appointmentsThisWeek = appointments.filter(a =>
    isWithinInterval(a.date, { start: thisWeekStart, end: thisWeekEnd })
  );

  const appointmentsPrevWeek = appointments.filter(a =>
    isWithinInterval(a.date, { start: prevWeekStart, end: prevWeekEnd })
  );

  const doctorsPrevMonth = doctors.filter(d =>
    isWithinInterval(d.createdAt, {
      start: prevMonthStart,
      end: prevMonthEnd
    })
  );

  const doctorsThisMonth = doctors.filter(d =>
    isWithinInterval(d.createdAt, {
      start: thisMonthStart,
      end: thisMonthEnd
    })
  );

  const pendingAppointments = appointments.filter(
    a => a.status === AppointmentStatus.pending
  );

  const pendingPrevWeek = appointmentsPrevWeek.filter(
    a => a.status === AppointmentStatus.pending
  );

  const cities = new Set(users.map(u => u.city).filter(Boolean));

  const prevCities = new Set(
    users
      .filter(u =>
        isWithinInterval(u.createdAt, {
          end: prevMonthEnd,
          start: prevMonthStart
        })
      )
      .map(u => u.city)
      .filter(Boolean)
  );

  const doctorChange = formatChange(
    doctorsThisMonth.length,
    doctorsPrevMonth.length
  );

  const pendingChange = formatChange(
    pendingPrevWeek.length,
    pendingAppointments.length
  );

  const appointmentChange = formatChange(
    appointmentsThisWeek.length,
    appointmentsPrevWeek.length
  );

  const cityChange = formatChange(cities.size, prevCities.size);

  return [
    {
      action: appointmentChange,
      summary: 'Week over week comparison',
      description: 'Appointments This Week',
      subtitle: 'Appointments scheduled this week',
      title: appointmentsThisWeek.length.toString()
    },
    {
      action: doctorChange,
      description: 'Active Doctors',
      title: doctors.length.toString(),
      summary: 'Change since last month',
      subtitle: `${doctors.length} doctors currently registered`
    },
    {
      action: pendingChange,
      summary: 'Pending bookings trend',
      description: 'Pending Appointments',
      title: pendingAppointments.length.toString(),
      subtitle: `${pendingAppointments.length} awaiting confirmation`
    },
    {
      action: cityChange,
      description: 'Cities Served',
      title: cities.size.toString(),
      summary: 'Change in service coverage',
      subtitle: Array.from(cities)
        .map(c => capitalize(c as string))
        .join(', ')
    }
  ];
}

export async function getUserDashboardCards(userId: string) {
  const [specialities, appointments, doctors] = await Promise.all([
    prisma.speciality.findMany({ select: { name: true } }),
    prisma.appointment.findMany({
      where: { patientId: userId },
      select: { date: true, status: true }
    }),
    prisma.user.findMany({
      select: { name: true },
      where: { UserRoles: { some: { role: { name: ROLES.DOCTOR as string } } } }
    })
  ]);

  const upcoming = appointments.filter(
    a => isFuture(a.date) && a.status !== AppointmentStatus.cancelled
  );

  const completed = appointments.filter(
    a => isPast(a.date) && a.status === AppointmentStatus.confirmed
  );

  return [
    {
      description: 'Available Doctors',
      title: doctors.length.toString(),
      summary: 'Available for consultation',
      subtitle: `${doctors.length} medical professional${doctors.length !== 1 ? 's' : String()}`,
      action: doctors.length
        ? `+${((doctors.length / doctors.length) * 100).toFixed(0)}%`
        : '+0%'
    },
    {
      title: completed.length.toString(),
      description: 'Completed Appointments',
      summary: 'Track your healthcare history',
      subtitle: `${completed.length} appointment${completed.length !== 1 ? 's' : ''} completed`,
      action: completed.length
        ? `+${((completed.length / (appointments.length || 1)) * 100).toFixed(0)}%`
        : '+0%'
    },
    {
      description: 'Available Specialties',
      title: specialities.length.toString(),
      summary: 'More expertise now available',
      action: specialities.length ? `+${specialities.length}` : '+0',
      subtitle: specialities.map(s => capitalize(s.name)).join(', ')
    },
    {
      title: upcoming.length.toString(),
      description: 'Upcoming Appointments',
      summary: 'Stay prepared for your next visit',
      subtitle: `You have ${upcoming.length} upcoming appointment${upcoming.length !== 1 ? 's' : String()}`,
      action: upcoming.length
        ? `+${((upcoming.length / (appointments.length || 1)) * 100).toFixed(0)}%`
        : '+0%'
    }
  ];
}
