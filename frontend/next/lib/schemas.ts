import z from 'zod';
import { MAX_DATE, MIN_DATE } from '@/lib/constants';

const emailVerified = z.object({
  emailVerified: z.enum(['yes', 'no']).optional()
});

const appointmentTime = z.object({
  time: z.string().min(1, { message: 'Should be valid.' })
});

const name = z.object({
  name: z.string().min(1, { message: 'Should be valid.' })
});

const email = z.object({
  email: z.string().email({ message: 'Email should be valid.' })
});

const notes = z.object({
  notes: z.string().min(10, { message: 'Should be valid.' }).optional()
});

const password = z.object({
  password: z.string().min(1, { message: 'Password should be valid.' })
});

const gender = z.object({
  gender: z.enum(['male', 'female'], { message: 'Gender should be valid.' })
});

const city = z.object({
  city: z.string().toUpperCase().min(1, { message: 'City should be valid.' })
});

const permissions = z.object({
  permissions: z.array(z.string().min(1, { message: 'Name should be valid.' }))
});

const roles = z.object({
  roles: z
    .array(z.string().min(1, { message: 'Name should be valid.' }))
    .min(1, { message: 'At least one role must be selected.' })
});

const specialities = z.object({
  specialities: z
    .array(z.string().min(1, { message: 'Id should be valid.' }))
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
    .array(z.string().toUpperCase().min(1, { message: 'Day should be valid.' }))
    .min(1, { message: 'Select at least one day of visit.' })
});

const appointmentDate = z.object({
  date: z
    .date()
    .max(MAX_DATE, { message: `Date must be less than ${MAX_DATE}` })
    .min(MIN_DATE, { message: `Date must be greater than ${MIN_DATE}` })
});

const image = z.object({
  image: z
    .any()
    .optional()
    .refine(
      fileList => {
        if (!fileList || !fileList.length) return true;
        return fileList[0].name?.length >= 5;
      },
      { message: 'File name should be at least 5 characters.' }
    )
});

const timings = z.object({
  timings: z.array(
    z.object({
      id: z.string().min(1, { message: 'Id should be valid.' }),
      duration: z
        .number()
        .positive({ message: 'Duration must be a positive number' }),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'Invalid time format. Expected HH:MM:SS (24-hour format)'
      })
    })
  )
});

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
  .merge(specialities);

export const doctorProfileSchema = doctorSchema.merge(
  z.object({
    password: z.union([z.literal(String()), password.shape.password])
  })
);

export const userProfileSchema = name
  .merge(email)
  .merge(image)
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
