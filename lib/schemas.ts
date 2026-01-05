import { Gender, RenewalType, SubscriptionStatus } from '@prisma/client';
import { z } from 'zod';

import { TIME_REG_EX, PHONE_REG_EX } from '@/constants/regex';
import { DATES } from '@/lib/constants';
import { schema } from '@/lib/utils';

export const loginSchema = z.object({
  email: schema(z.email()),
  password: schema(z.string(), { lowerCase: false })
});

export const rolePermissionsSchema = z.object({
  name: schema(z.string(), { min: 5 }),
  permissions: z.array(schema(z.string()))
});

const pharmaBaseSchema = z.object({
  description: schema(z.string(), { empty: true, min: 10 }),
  name: schema(z.string(), { min: 5 })
});

export const signupSchema = z.object({
  email: schema(z.email()),
  name: schema(z.string(), { min: 5 }),
  password: schema(z.string(), { lowerCase: false })
});

export const userRolesSchema = z.object({
  email: schema(z.email()),
  name: schema(z.string(), { min: 5 }),
  roles: z.array(schema(z.string())).min(1)
});

export const pharmaCodeSchema = z.object({
  code: schema(z.string()),
  description: schema(z.string(), { empty: true, min: 10 }),
  frequency: schema(z.coerce.number(), { min: 1 })
});

export const userSchema = z.object({
  email: schema(z.email()),
  emailVerified: schema(z.enum(['yes', 'no'])),
  name: schema(z.string(), { min: 5 }),
  password: schema(z.string(), { lowerCase: false })
});

export const membershipSubscriptionSchema = z.object({
  feeId: schema(z.string()),
  membershipId: schema(z.string()),
  status: schema(z.enum(SubscriptionStatus)),
  users: z.array(schema(z.string()))
});

export const hospitalSchema = z.object({
  address: schema(z.string()),
  city: schema(z.string()),
  doctors: z.array(schema(z.string())),
  email: schema(z.email()),
  isAffiliated: schema(z.enum(['yes', 'no'])),
  name: schema(z.string(), { min: 5 }),
  phone: schema(z.string(), { regex: PHONE_REG_EX as RegExp })
});

export const userProfileSchema = z.object({
  city: schema(z.string(), { empty: true, min: 5 }),
  cover: z.union([schema(z.string()), z.file()]),
  email: schema(z.email()),
  gender: schema(z.enum(Gender), { empty: true }),
  image: z.union([schema(z.string()), z.file()]),
  name: schema(z.string(), { min: 5 }),
  password: schema(z.string(), { empty: true, lowerCase: false }),
  phone: schema(z.string(), { empty: true, regex: PHONE_REG_EX as RegExp })
});

export const membershipSchema = z.object({
  fees: z.array(
    z.object({
      amount: schema(z.number().positive().optional()),
      renewalType: schema(z.enum(RenewalType))
    })
  ),
  hospitalMemberships: z.array(schema(z.object({ hospital: hospitalSchema }))),
  name: schema(z.string(), { min: 5 }),
  perks: z.array(schema(z.string(), { min: 10 }))
});

export const appointmentSchema = z.object({
  city: schema(z.string()),
  date: schema(
    z
      .date()
      .min(DATES.MIN_DATE as Date, {
        message: `Date must be greater than ${DATES.MIN_DATE}`
      })
      .max(DATES.MAX_DATE as Date, {
        message: `Date must be less than ${DATES.MAX_DATE}`
      })
  ),
  email: schema(z.email()),
  name: schema(z.string(), { min: 5 }),
  notes: schema(z.string(), { min: 10 }),
  phone: schema(z.string(), { regex: PHONE_REG_EX as RegExp }),
  time: schema(z.string())
});

export const doctorSchema = z.object({
  city: schema(z.string(), { empty: true, min: 5 }),
  cover: z.union([schema(z.string()), z.file()]),
  daysOfVisit: z.array(schema(z.string())).min(1),
  email: schema(z.email()),
  emailVerified: schema(z.enum(['yes', 'no'])),
  experience: schema(z.coerce.number(), { min: 1 }),
  gender: z.enum(Gender),
  image: z.union([schema(z.string()), z.file()]),
  name: schema(z.string(), { min: 5 }),
  password: schema(z.string(), { lowerCase: false }),
  phone: schema(z.string(), { regex: PHONE_REG_EX as RegExp }),
  specialities: z.array(schema(z.string())).min(1),
  timings: z.array(
    z.object({
      duration: schema(z.number().positive()),
      id: schema(z.string()),
      time: schema(z.string(), { regex: TIME_REG_EX as RegExp })
    })
  )
});

export const nameSchema = z.object({ name: schema(z.string(), { min: 5 }) });

export const roleSchema = nameSchema;
export const seedSchema = z.object({});

export const facilitySchema = nameSchema;
export const departmentSchema = nameSchema;
export const permissionSchema = nameSchema;

export const pharmaSaltSchema = pharmaBaseSchema;
export const pharmaBrandSchema = pharmaBaseSchema;

export const medicationFormSchema = pharmaBaseSchema;
export const pharmaManufacturerSchema = pharmaBaseSchema;

export const emailSchema = z.object({ email: schema(z.email()) });
export const bioSchema = z.object({ bio: schema(z.string(), { min: 10 }) });

export const doctorProfileSchema = doctorSchema.extend({
  emailVerified: schema(z.enum(['yes', 'no'])).optional(),
  password: schema(z.string(), { empty: true, lowerCase: false })
});
