import {
  AppointmentStatus,
  Gender,
  RenewalType,
  SubscriptionStatus
} from '@prisma/client';
import { z } from 'zod';

import { TIME_REG_EX, PHONE_REG_EX } from '@/constants/regex';
import { DATES } from '@/lib/constants';
import { exp, getDate, min, positive, required, valid } from '@/lib/utils';

export const loginSchema = z.object({
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: valid('password') })
    .nonempty(required('password'))
    .trim()
});

export const rolePermissionsSchema = z.object({
  name: z
    .string({ error: valid('role') })
    .nonempty(required('role'))
    .trim()
    .toLowerCase(),
  permissions: z.array(
    z
      .string({ error: valid('permission') })
      .nonempty(required('permission'))
      .trim()
      .toLowerCase()
  )
});

const pharmaBaseSchema = z.object({
  description: z
    .string({ error: valid('name') })
    .trim()
    .toLowerCase(),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase()
});

export const signupSchema = z.object({
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: valid('password') })
    .nonempty(required('password'))
    .trim()
});

export const userRolesSchema = z.object({
  id: z
    .string({ error: valid('id') })
    .nonempty(required('id'))
    .trim()
    .toLowerCase(),
  roles: z
    .array(
      z
        .string({ error: valid('role') })
        .nonempty(required('role'))
        .trim()
        .toLowerCase()
    )
    .min(1)
});

export const pharmaCodeSchema = z.object({
  code: z
    .string({ error: valid('code') })
    .nonempty(required('code'))
    .trim()
    .toLowerCase(),
  description: z
    .string({ error: valid('name') })
    .trim()
    .toLowerCase(),
  frequency: z.coerce
    .number({ error: valid('frequency') })
    .positive(positive('frequency'))
});

export const userSchema = z.object({
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  emailVerified: z.enum(['yes', 'no']),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: valid('password') })
    .nonempty(required('password'))
    .trim()
});

export const membershipSubscriptionSchema = z.object({
  feeId: z
    .string({ error: valid('id') })
    .nonempty(required('id'))
    .trim()
    .toLowerCase(),
  membershipId: z
    .string({ error: valid('id') })
    .nonempty(required('id'))
    .trim()
    .toLowerCase(),
  status: z.enum(SubscriptionStatus),
  users: z.array(
    z
      .string({ error: valid('id') })
      .nonempty(required('id'))
      .trim()
      .toLowerCase()
  )
});

export const hospitalSchema = z.object({
  address: z
    .string({ error: valid('address') })
    .trim()
    .toLowerCase(),
  city: z
    .string({ error: valid('city') })
    .trim()
    .toLowerCase(),
  doctors: z.array(
    z
      .string({ error: valid('id') })
      .nonempty(required('id'))
      .trim()
      .toLowerCase()
  ),
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  hospitalDepartments: z.array(
    z
      .string({ error: valid('id') })
      .nonempty(required('id'))
      .trim()
      .toLowerCase()
  ),
  hospitalMemberships: z.array(
    z
      .string({ error: valid('id') })
      .nonempty(required('id'))
      .trim()
      .toLowerCase()
  ),
  isAffiliated: z.enum(['yes', 'no']),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  phone: z
    .string({ error: valid('phone') })
    .regex(PHONE_REG_EX as RegExp, { error: exp('phone', '+919876543210') })
    .trim()
    .toLowerCase()
});

export const userProfileSchema = z.object({
  city: z
    .string({ error: valid('city') })
    .trim()
    .toLowerCase(),
  cover: z.union([
    z
      .string({ error: valid('file') })
      .trim()
      .toLowerCase(),
    z.file()
  ]),
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  gender: z.enum(Gender),
  image: z.union([
    z
      .string({ error: valid('file') })
      .trim()
      .toLowerCase(),
    z.file()
  ]),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: valid('password') })
    .nonempty(required('password'))
    .trim(),
  phone: z
    .string({ error: valid('phone') })
    .regex(PHONE_REG_EX as RegExp, { error: exp('phone', '+919876543210') })
    .trim()
    .toLowerCase()
});

export const membershipSchema = z.object({
  fees: z.array(
    z.object({
      amount: z.coerce
        .number({ error: valid('amount') })
        .positive(positive('amount'))
        .optional(),
      renewalType: z.enum(RenewalType)
    })
  ),
  hospitalMemberships: z.array(z.object({ hospital: hospitalSchema })),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  perks: z.array(
    z
      .string({ error: valid('perk') })
      .nonempty(required('perk'))
      .trim()
      .toLowerCase()
  )
});

export const appointmentSchema = z.object({
  city: z
    .string({ error: valid('name') })
    .trim()
    .toLowerCase(),
  date: z
    .date()
    .min(DATES.MIN_DATE as Date, {
      error: `Date must be greater than ${getDate(DATES.MIN_DATE.toString(), false, false)}`
    })
    .max(DATES.MAX_DATE as Date, {
      error: `Date must be less than ${getDate(DATES.MAX_DATE.toString(), false, false)}`
    }),
  doctor: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  notes: z
    .string({ error: valid('notes') })
    .trim()
    .toLowerCase(),
  phone: z
    .string({ error: valid('phone') })
    .regex(PHONE_REG_EX as RegExp, { error: exp('phone', '+919876543210') })
    .trim()
    .toLowerCase(),
  time: z
    .string({ error: valid('time') })
    .nonempty(required('time'))
    .trim()
    .toLowerCase()
});

export const doctorSchema = z.object({
  city: z
    .string({ error: valid('city') })
    .trim()
    .toLowerCase(),
  cover: z.union([
    z
      .string({ error: valid('file') })
      .trim()
      .toLowerCase(),
    z.file()
  ]),
  daysOfVisit: z
    .array(
      z
        .string({ error: valid('id') })
        .nonempty(required('id'))
        .trim()
        .toLowerCase()
    )
    .min(1),
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  experience: z.coerce
    .number({ error: valid('experience') })
    .positive(positive('experience')),
  gender: z.enum(Gender),
  image: z.union([
    z
      .string({ error: valid('file') })
      .trim()
      .toLowerCase(),
    z.file()
  ]),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: valid('password') })
    .nonempty(required('password'))
    .trim(),
  phone: z
    .string({ error: valid('phone') })
    .regex(PHONE_REG_EX as RegExp, { error: exp('phone', '+919876543210') })
    .trim()
    .toLowerCase(),
  specialities: z
    .array(
      z
        .string({ error: valid('id') })
        .nonempty(required('id'))
        .trim()
        .toLowerCase()
    )
    .min(1),
  timings: z.array(
    z.object({
      duration: z.coerce
        .number({ error: valid('duration') })
        .positive(positive('duration')),
      id: z
        .string({ error: valid('id') })
        .nonempty(required('id'))
        .trim()
        .toLowerCase(),
      time: z
        .string({ error: valid('time') })
        .regex(TIME_REG_EX as RegExp, { error: exp('time', '10:00 AM') })
        .trim()
        .toLowerCase()
    })
  )
});

export const nameSchema = z.object({
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase()
});

export const doctorProfileSchema = doctorSchema.extend({
  emailVerified: z.enum(['yes', 'no']).optional(),
  password: z
    .string({ error: valid('password') })
    .nonempty(required('password'))
    .trim()
});

export const emailSchema = z.object({
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase()
});

export const bioSchema = z.object({
  bio: z
    .string({ error: valid('bio') })
    .trim()
    .toLowerCase()
});

export const roleSchema = nameSchema;
export const seedSchema = z.object({});

export const permissionSchema = nameSchema;

export const pharmaSaltSchema = pharmaBaseSchema;
export const pharmaBrandSchema = pharmaBaseSchema;

export const medicationFormSchema = pharmaBaseSchema;
export const pharmaManufacturerSchema = pharmaBaseSchema;

export const facilitySchema = z.object({
  departments: z.array(
    z
      .string({ error: valid('id') })
      .nonempty(required('id'))
      .trim()
      .toLowerCase()
  ),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase()
});

export const departmentSchema = z.object({
  facilities: z.array(
    z
      .string({ error: valid('id') })
      .nonempty(required('id'))
      .trim()
      .toLowerCase()
  ),
  hospitals: z.array(
    z
      .string({ error: valid('id') })
      .nonempty(required('id'))
      .trim()
      .toLowerCase()
  ),
  name: z
    .string({ error: valid('name') })
    .nonempty(required('name'))
    .trim()
    .toLowerCase()
});

export const appointmentSummarySchema = z.object({
  appointmentHospitals: z.array(
    z
      .string({ error: valid('hospital') })
      .nonempty({ error: required('hospital') })
      .trim()
      .toLowerCase()
  ),
  benificiaryId: z
    .string({ error: valid('benificiary') })
    .trim()
    .toLowerCase(),
  city: z
    .string({ error: valid('city') })
    .trim()
    .toLowerCase(),
  date: z.date({ error: valid('date') }),
  doctorId: z
    .string({ error: valid('doctor') })
    .nonempty({ error: required('doctor') })
    .trim()
    .toLowerCase(),
  email: z
    .email({ error: valid('email') })
    .trim()
    .toLowerCase(),
  facilities: z.array(
    z
      .string({ error: valid('facility') })
      .nonempty({ error: required('facility') })
      .trim()
      .toLowerCase()
  ),
  isReferred: z.enum(['yes', 'no']).default('no'),
  name: z
    .string({ error: valid('name') })
    .min(5, min('name', 5))
    .trim()
    .toLowerCase(),
  notes: z
    .string({ error: valid('notes') })
    .trim()
    .toLowerCase(),
  patientId: z
    .string({ error: valid('patient') })
    .nonempty({ error: required('patient') })
    .trim()
    .toLowerCase(),
  phone: z
    .string({ error: valid('phone') })
    .regex(PHONE_REG_EX as RegExp, { error: exp('phone', '+919876543210') })
    .trim()
    .toLowerCase(),
  prescriptions: z.array(
    z
      .string({ error: valid('prescription') })
      .nonempty({ error: required('prescription') })
      .trim()
      .toLowerCase()
  ),
  reports: z.array(
    z.union([
      z
        .string({ error: valid('file') })
        .trim()
        .toLowerCase(),
      z.file()
    ])
  ),
  status: z.enum(AppointmentStatus),
  timeSlotId: z
    .string({ error: valid('timing') })
    .nonempty({ error: required('timing') })
    .trim()
    .toLowerCase()
});
