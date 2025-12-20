import { Gender, RenewalType, SubscriptionStatus } from '@prisma/client';
import z from 'zod';

import { DATES } from '@/lib/constants';

const emailVerified = z.object({
  emailVerified: z.enum(['yes', 'no']).optional()
});

const email = z.object({
  email: z.string().email({ message: 'Email should be valid.' })
});

const appointmentTime = z.object({
  time: z.string().toLowerCase().min(1, { message: 'Should be valid.' })
});

const name = z.object({
  name: z.string().toLowerCase().min(1, { message: 'Should be valid.' })
});

const notes = z.object({
  notes: z.string().min(10, { message: 'Should be valid.' }).optional()
});

const password = z.object({
  password: z.string().min(1, { message: 'Password should be valid.' })
});

const gender = z.object({
  gender: z.enum([Gender.male, Gender.female], {
    message: 'Gender should be valid.'
  })
});

const city = z.object({
  city: z.string().toLowerCase().min(1, { message: 'City should be valid.' })
});

const bio = z.object({
  bio: z.string().min(10, { message: 'Bio should be at least 10 characters' })
});

const permissions = z.object({
  permissions: z.array(
    z.string().toLowerCase().min(1, { message: 'Name should be valid.' })
  )
});

const roles = z.object({
  roles: z
    .array(
      z.string().toLowerCase().min(1, { message: 'Name should be valid.' })
    )
    .min(1, { message: 'At least one role must be selected.' })
});

const specialities = z.object({
  specialities: z
    .array(z.string().toLowerCase().min(1, { message: 'Id should be valid.' }))
    .min(1, { message: 'At least one speciality must be selected.' })
});

const experience = z.object({
  experience: z.coerce
    .number()
    .min(1, { message: 'Experience should be valid.' })
});

const phone = z.object({
  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, { message: 'Invalid phone number format.' })
});

const visitDays = z.object({
  daysOfVisit: z
    .array(z.string().toLowerCase().min(1, { message: 'Day should be valid.' }))
    .min(1, { message: 'Select at least one day of visit.' })
});

const appointmentDate = z.object({
  date: z
    .date()
    .max(DATES.MAX_DATE as Date, {
      message: `Date must be less than ${DATES.MAX_DATE}`
    })
    .min(DATES.MIN_DATE as Date, {
      message: `Date must be greater than ${DATES.MIN_DATE}`
    })
});

const image = z.object({
  image: z
    .any()
    .optional()
    .refine(
      val => {
        if (typeof val === 'string') return true;
        if (!val || !val.length) return true;
        return val[0]?.name?.length >= 5;
      },
      { message: 'File name should be at least 5 characters.' }
    )
});

const timings = z.object({
  timings: z.array(
    z.object({
      duration: z
        .number()
        .positive({ message: 'Duration must be a positive number' }),
      id: z.string().min(1, { message: 'Id should be valid.' }),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'Invalid time format. Expected HH:MM:SS (24-hour format)'
      })
    })
  )
});

export const bioSchema = bio;
export const nameSchema = name;
export const roleSchema = name;

export const emailSchema = email;
export const permissionSchema = name;

export const seedSchema = z.object({});
export const loginSchema = email.merge(password);

export const signupSchema = name.merge(loginSchema);
export const userSchema = signupSchema.merge(emailVerified);

export const rolePermissionsSchema = name.merge(permissions);
export const userRolesSchema = name.merge(email).merge(roles);

export const appointmentSchema = name
  .merge(city)
  .merge(notes)
  .merge(email)
  .merge(phone)
  .merge(appointmentDate)
  .merge(appointmentTime);

export const doctorSchema = userSchema
  .merge(city)
  .merge(phone)
  .merge(image)
  .merge(gender)
  .merge(timings)
  .merge(visitDays)
  .merge(experience)
  .merge(specialities)
  .merge(z.object({ cover: image.shape.image }));

export const doctorProfileSchema = doctorSchema.merge(
  z.object({
    password: z.union([z.literal(String()), password.shape.password])
  })
);

export const userProfileSchema = name
  .merge(email)
  .merge(image)
  .merge(z.object({ cover: image.shape.image }))
  .merge(
    z.object({
      city: z.union([z.literal(String()), city.shape.city])
    })
  )
  .merge(
    z.object({
      phone: z.union([z.literal(String()), phone.shape.phone])
    })
  )
  .merge(
    z.object({
      gender: z.union([z.literal(String()), gender.shape.gender])
    })
  )
  .merge(
    z.object({
      password: z.union([z.literal(String()), password.shape.password])
    })
  );

export const hospitalSchema = z.object({
  address: z.union([z.literal(String()), name.shape.name]),
  city: city.shape.city,
  doctors: z.array(z.string()),
  email: email.shape.email,
  isAffiliated: emailVerified.shape.emailVerified,
  name: z.string().min(5, { message: 'Name should be atleast 5 characters.' }),
  phone: phone.shape.phone
});

export const facilitySchema = name;
export const departmentSchema = name;

export const pharmaCodeSchema = z.object({
  code: name.shape.name,
  description: z.union([
    z.literal(String()),
    z
      .string()
      .min(10, { message: 'Description should be atleast 10 characters' })
  ]),
  frequency: experience.shape.experience
});

export const pharmaManufacturerSchema = z.object({
  description: z.union([
    z.literal(String()),
    pharmaCodeSchema.shape.description
  ]),
  name: name.shape.name
});

export const pharmaSaltSchema = pharmaManufacturerSchema;
export const pharmaBrandSchema = pharmaManufacturerSchema;
export const medicationFormSchema = pharmaManufacturerSchema;

export const membershipSchema = z.object({
  fees: z.array(
    z.object({
      amount: z.number().positive({ message: 'Should be a positive number.' }),
      renewalType: z.nativeEnum(RenewalType)
    })
  ),
  hospitalMemberships: z.array(hospitalSchema),
  name: z.string().min(5, { message: 'Name should be atleast 5 characters.' }),
  perks: z.array(z.string().min(10, 'Should be atleast 10 characters.'))
});

export const membershipSubscriptionSchema = z.object({
  feeId: z.string(),
  membershipId: z.string(),
  status: z.nativeEnum(SubscriptionStatus),
  users: z.array(z.string())
});
