import { Gender, RenewalType, SubscriptionStatus } from '@prisma/client';
import { z } from 'zod';

import { DATES } from '@/lib/constants';

export const yesNo = z.enum(['yes', 'no']);
const email = z.email().trim().toLowerCase();
const password = (min = 1) => z.string().trim().min(min);
const text = (min = 1) => z.string().trim().min(min).toLowerCase();

const phone = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^\+?\d{10,15}$/);

const optionalFileField = z
  .any()
  .refine(val => {
    if (typeof val === 'string') return true;
    if (!val || !val.length) return true;
    return val[0]?.name?.length >= 5;
  })
  .nullish();

const timingSchema = z.object({
  duration: z.number().positive(),
  id: z.string().trim(),
  time: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
});

const baseDoctorSchema = {
  city: text().nullish(),
  cover: optionalFileField,
  daysOfVisit: z.array(text()).min(1),
  email: email,
  emailVerified: yesNo.nullish(),
  experience: z.coerce.number().min(1),
  gender: z.enum(Gender),
  image: optionalFileField,
  name: text(),
  phone: phone,
  specialities: z.array(text()).min(1),
  timings: z.array(timingSchema)
};

export const loginSchema = z.object({
  email: email,
  password: password()
});

export const rolePermissionsSchema = z.object({
  name: text(),
  permissions: z.array(text())
});

export const doctorSchema = z.object({
  ...baseDoctorSchema,
  password: password()
});

export const doctorProfileSchema = z.object({
  ...baseDoctorSchema,
  password: password().nullish()
});

const pharmaBaseSchema = z.object({
  description: text(10).nullish(),
  name: text()
});

export const signupSchema = z.object({
  email: email,
  name: text(),
  password: password()
});

export const userRolesSchema = z.object({
  email: email,
  name: text(),
  roles: z.array(text()).min(1)
});

export const pharmaCodeSchema = z.object({
  code: text(),
  description: text(10).nullish(),
  frequency: z.coerce.number().min(1)
});

export const userSchema = z.object({
  email: email,
  emailVerified: yesNo.nullish(),
  name: text(),
  password: password()
});
export const membershipSubscriptionSchema = z.object({
  feeId: z.string().trim(),
  membershipId: z.string().trim(),
  status: z.enum(SubscriptionStatus),
  users: z.array(z.string().trim())
});

export const hospitalSchema = z.object({
  address: text(),
  city: text(),
  doctors: z.array(z.string().trim().toLowerCase()),
  email: email,
  isAffiliated: yesNo.nullish(),
  name: text(5),
  phone: phone
});

export const userProfileSchema = z.object({
  city: text().nullish(),
  cover: optionalFileField,
  email: email,
  gender: z.enum(Gender),
  image: optionalFileField,
  name: text(),
  password: password(1),
  phone: phone
});

export const membershipSchema = z.object({
  fees: z.array(
    z.object({
      amount: z.number().positive().nullish(),
      renewalType: z.enum(RenewalType)
    })
  ),
  hospitalMemberships: z.array(
    z.object({
      hospital: hospitalSchema
    })
  ),
  name: text(5),
  perks: z.array(text(10))
});

export const appointmentSchema = z.object({
  city: text(),
  date: z
    .date()
    .min(DATES.MIN_DATE as Date, {
      message: `Date must be greater than ${DATES.MIN_DATE}`
    })
    .max(DATES.MAX_DATE as Date, {
      message: `Date must be less than ${DATES.MAX_DATE}`
    }),
  email: email,
  name: text(),
  notes: text(10).nullish(),
  phone: phone,
  time: text()
});

export const nameSchema = z.object({ name: text() });

export const roleSchema = nameSchema;
export const seedSchema = z.object({});

export const facilitySchema = nameSchema;
export const departmentSchema = nameSchema;
export const permissionSchema = nameSchema;

export const pharmaSaltSchema = pharmaBaseSchema;
export const pharmaBrandSchema = pharmaBaseSchema;
export const bioSchema = z.object({ bio: text(10) });

export const medicationFormSchema = pharmaBaseSchema;
export const emailSchema = z.object({ email: email });
export const pharmaManufacturerSchema = pharmaBaseSchema;
