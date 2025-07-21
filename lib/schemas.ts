import z from 'zod';

export const seedSchema = z.object({});

export const nameSchema = z.object({
  name: z.string().min(1, { message: 'Should be valid.' })
});

export const roleSchema = z.object({
  name: z.string().min(1, { message: 'Should be valid.' })
});

export const permissionSchema = z.object({
  name: z.string().min(1, { message: 'Should be valid.' })
});

export const emailSchema = z.object({
  email: z.string().email({ message: 'Email should be valid.' })
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email should be valid.' }),
  password: z.string().min(1, { message: 'Password should be valid.' })
});

export const signupSchema = z.object({
  email: z.string().email({ message: 'Email should be valid.' }),
  password: z.string().min(1, { message: 'Password should be valid.' }),
  name: z.string().min(3, { message: 'Should be atleast 3 characters.' })
});

export const rolesSchema = z.object({
  name: z.string().min(1, { message: 'Should be valid.' }),
  email: z.string().email({ message: 'Email should be valid.' }),
  roles: z
    .array(z.string().min(1, { message: 'Role should be valid.' }))
    .min(1, { message: 'At least one role must be selected.' })
});

export const userSchema = z.object({
  emailVerified: z.enum(['yes', 'no']).optional(),
  email: z.string().email({ message: 'Email should be valid.' }).optional(),
  password: z
    .string()
    .min(1, { message: 'Password should be valid.' })
    .optional(),
  name: z
    .string()
    .min(3, { message: 'Should be atleast 3 characters.' })
    .optional()
});

export const doctorSchema = z.object({
  email: z.string().email({ message: 'Email should be valid.' }),
  password: z.string().min(1, { message: 'Password should be valid.' }),
  name: z.string().min(3, { message: 'Should be atleast 3 characters.' }),
  gender: z.enum(['male', 'female'], { message: 'Gender should be valid.' }),
  city: z.string().toUpperCase().min(1, { message: 'City should be valid.' }),
  specialities: z
    .array(z.string().min(1, { message: 'Id should be valid.' }))
    .min(1, { message: 'At least one speciality must be selected.' }),
  experience: z.coerce
    .number()
    .min(1, { message: 'Experience should be valid.' }),
  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, { message: 'Invalid phone number format.' }),
  daysOfVisit: z
    .array(z.string().toUpperCase().min(1, { message: 'Day should be valid.' }))
    .min(1, { message: 'Select at least one day of visit.' }),
  image: z
    .any()
    .optional()
    .refine(
      fileList => {
        if (!fileList || !fileList.length) return true;
        return fileList[0].name?.length >= 5;
      },
      { message: 'File name should be at least 5 characters.' }
    ),
  timings: z.array(
    z.object({
      id: z.number().min(1, { message: 'Id should be valid.' }),
      duration: z
        .number()
        .positive({ message: 'Duration must be a positive number' }),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'Invalid time format. Expected HH:MM:SS (24-hour format)'
      })
    })
  )
});
